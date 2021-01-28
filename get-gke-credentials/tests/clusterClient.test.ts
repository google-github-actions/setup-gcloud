import { expect } from 'chai';
import 'mocha';
import { JWT } from 'google-auth-library';
import YAML from 'yaml';

const credentials = process.env.GET_GKE_CRED_SA_KEY_JSON;
const project = process.env.GET_GKE_CRED_PROJECT;
const name = process.env.GET_GKE_CRED_CLUSTER_NAME;
const location = process.env.GKE_AUTH_CLUSTER_LOCATION || 'us-central1-a';

const publicCluster: ClusterResponse = {
  data: {
    name: 'public-cluster',
    endpoint: 'public-endpoint',
    masterAuth: {
      clusterCaCertificate: 'foo',
    },
    privateClusterConfig: {
      privateEndpoint: '',
    },
  },
};

const privateCluster: ClusterResponse = {
  data: {
    name: 'private-cluster',
    endpoint: '',
    masterAuth: {
      clusterCaCertificate: 'foo',
    },
    privateClusterConfig: {
      privateEndpoint: 'private-endpoint',
    },
  },
};

import { ClusterClient, ClusterResponse } from '../src/gkeClient';

describe('Cluster', function () {
  it('initializes with JSON creds', function () {
    const client = new ClusterClient(location, {
      credentials: `{"foo":"bar"}`,
      projectId: 'test',
    });
    expect(client.auth.jsonContent).eql({ foo: 'bar' });
  });

  it('initializes with ADC', async function () {
    if (
      !process.env.GCLOUD_PROJECT ||
      !process.env.GOOGLE_APPLICATION_CREDENTIALS
    ) {
      this.skip();
    }
    const client = new ClusterClient(location);
    expect(client.auth.jsonContent).eql(null);
    const auth = (await client.getAuthClient()) as JWT;
    expect(auth.key).to.not.eql(undefined);
  });

  it('can get cluster', async function () {
    if (!credentials || !name) {
      this.skip();
    }
    const client = new ClusterClient(location, {
      credentials: credentials,
      projectId: project,
    });
    const result = await client.getCluster(name);

    expect(result).to.not.eql(null);
    expect(result.data.endpoint).to.not.be.null;
    expect(result.data.masterAuth.clusterCaCertificate).to.not.be.null;
  });

  it('can get token', async function () {
    if (!credentials) {
      this.skip();
    }
    const client = new ClusterClient('foo', {
      credentials: credentials,
      projectId: project,
    });
    const token = await client.getToken();

    expect(token).to.not.eql(null);
  });

  it('can get generate kubeconfig with token for public clusters', async function () {
    if (!credentials) {
      this.skip();
    }
    const client = new ClusterClient('foo', {
      credentials: credentials,
      projectId: project,
    });
    const kubeconfig = YAML.parse(
      await client.createKubeConfig('false', 'false', publicCluster),
    );

    expect(kubeconfig.clusters[0].name).to.eql(publicCluster.data.name);
    expect(kubeconfig.clusters[0].cluster['certificate-authority-data']).to.eql(
      publicCluster.data.masterAuth.clusterCaCertificate,
    );
    expect(kubeconfig.clusters[0].cluster.server).to.eql(
      `https://${publicCluster.data.endpoint}`,
    );
    expect(kubeconfig['current-context']).to.eql(publicCluster.data.name);
    expect(kubeconfig.users[0].name).to.eql(publicCluster.data.name);
    expect(kubeconfig.users[0].user.token).to.be.not.null;
    expect(kubeconfig.users[0].user).to.not.have.property('auth-provider');
  });

  it('can get generate kubeconfig with auth plugin for public clusters', async function () {
    if (!credentials) {
      this.skip();
    }
    const client = new ClusterClient('foo', {
      credentials: credentials,
      projectId: project,
    });
    const kubeconfig = YAML.parse(
      await client.createKubeConfig('true', 'false', publicCluster),
    );

    expect(kubeconfig.clusters[0].name).to.eql(publicCluster.data.name);
    expect(kubeconfig.clusters[0].cluster['certificate-authority-data']).to.eql(
      publicCluster.data.masterAuth.clusterCaCertificate,
    );
    expect(kubeconfig.clusters[0].cluster.server).to.eql(
      `https://${publicCluster.data.endpoint}`,
    );
    expect(kubeconfig['current-context']).to.eql(publicCluster.data.name);
    expect(kubeconfig.users[0].name).to.eql(publicCluster.data.name);
    expect(kubeconfig.users[0].user['auth-provider'].name).to.eql('gcp');
    expect(kubeconfig.users[0].user).to.not.have.property('token');
  });

  it('can get generate kubeconfig with token for private clusters', async function () {
    if (!credentials) {
      this.skip();
    }
    const client = new ClusterClient('foo', {
      credentials: credentials,
      projectId: project,
    });
    const kubeconfig = YAML.parse(
      await client.createKubeConfig('false', 'true', privateCluster),
    );

    expect(kubeconfig.clusters[0].name).to.eql(privateCluster.data.name);
    expect(kubeconfig.clusters[0].cluster['certificate-authority-data']).to.eql(
      privateCluster.data.masterAuth.clusterCaCertificate,
    );
    expect(kubeconfig.clusters[0].cluster.server).to.eql(
      `https://${privateCluster.data.privateClusterConfig.privateEndpoint}`,
    );
    expect(kubeconfig['current-context']).to.eql(privateCluster.data.name);
    expect(kubeconfig.users[0].name).to.eql(privateCluster.data.name);
    expect(kubeconfig.users[0].user.token).to.be.not.null;
    expect(kubeconfig.users[0].user).to.not.have.property('auth-provider');
  });

  it('can get generate kubeconfig with auth plugin for private clusters', async function () {
    if (!credentials) {
      this.skip();
    }
    const client = new ClusterClient('foo', {
      credentials: credentials,
      projectId: project,
    });
    const kubeconfig = YAML.parse(
      await client.createKubeConfig('true', 'true', privateCluster),
    );

    expect(kubeconfig.clusters[0].name).to.eql(privateCluster.data.name);
    expect(kubeconfig.clusters[0].cluster['certificate-authority-data']).to.eql(
      privateCluster.data.masterAuth.clusterCaCertificate,
    );
    expect(kubeconfig.clusters[0].cluster.server).to.eql(
      `https://${privateCluster.data.privateClusterConfig.privateEndpoint}`,
    );
    expect(kubeconfig['current-context']).to.eql(privateCluster.data.name);
    expect(kubeconfig.users[0].name).to.eql(privateCluster.data.name);
    expect(kubeconfig.users[0].user['auth-provider'].name).to.eql('gcp');
    expect(kubeconfig.users[0].user).to.not.have.property('token');
  });
});
