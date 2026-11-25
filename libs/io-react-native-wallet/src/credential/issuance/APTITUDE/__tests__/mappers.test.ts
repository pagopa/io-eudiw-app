import type { MetadataResponseAPTITUDE } from '@pagopa/io-wallet-oid4vci';

import { mapToIssuerConfig } from '../mappers';

describe('mapToIssuerConfig', () => {
  it('maps a pre-authorized issuer with optional display and authorization metadata', () => {
    const input = {
      authorization_server_federation_claims: {
        metadata: {
          oauth_authorization_server: {
            token_endpoint: 'https://as.example/token'
          }
        }
      },
      metadata: {
        openid_credential_issuer: {
          credential_configurations_supported: {
            mDL: {
              credential_metadata: {
                claims: [
                  {
                    display: [{ name: 'Given name' }, { locale: 'it' }],
                    path: ['given_name']
                  }
                ]
              },
              doctype: 'org.iso.18013.5.1.mDL',
              format: 'mso_mdoc'
            }
          },
          credential_endpoint: 'https://issuer.example/credential',
          credential_issuer: 'https://issuer.example'
        }
      }
    } as unknown as MetadataResponseAPTITUDE;

    expect(mapToIssuerConfig(input)).toMatchObject({
      authorization_endpoint: '',
      credential_configurations_supported: {
        mDL: {
          claims: [
            {
              display: [{ locale: 'und', name: 'Given name' }],
              path: ['given_name']
            }
          ],
          display: []
        }
      },
      pushed_authorization_request_endpoint: '',
      token_endpoint: 'https://as.example/token'
    });
  });
});
