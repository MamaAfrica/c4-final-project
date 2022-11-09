import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://mamaafrica.us.auth0.com/.well-known/jwks.json'
// const cert = `-----BEGIN CERTIFICATE-----
// MIIDCTCCAfGgAwIBAgIJIIPyJrXWI95gMA0GCSqGSIb3DQEBCwUAMCIxIDAeBgNV
// BAMTF21hbWFhZnJpY2EudXMuYXV0aDAuY29tMB4XDTIyMTAzMTE0NTk1N1oXDTM2
// MDcwOTE0NTk1N1owIjEgMB4GA1UEAxMXbWFtYWFmcmljYS51cy5hdXRoMC5jb20w
// ggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDaY8WRclDCJLSp9GwNQVgW
// OkRHOhyhAF38VxEEFA0E0NaoJ9O38Tw5nqjzT17V12a9yWjlD340nCP3V5pHtn/Y
// mlpzY6U2XSRvnbEksuIaaTwgFUGTKz/gathe1SqN/vrXJfHHlNlo8WGcXrhGCJOs
// D3J1QoAS1ea6iakcLpESxZAwksdajCxGySaZK9ZzCWoltE4a0h0EGnLE2SWNUJf8
// IC+Ju+4XXHx6FM29G4QbL4/MP4I3PzirGp1hsPUjnSuzXJ5pvvfROMkbVHJev8Ux
// KsnZpWmT31Prd/1ma4op6WY4+xVsn+rYDQCjlxHHbun+q2YOdKnMgCquLX5ZQPz5
// AgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFAp+UjPKk69VbnZG
// 65MoC1kmjzaHMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEADa0g
// H82WEEtGJJrI4PS2f7etcb55rvnwihuaSZV/6C+AE8YgrijlE5Hn/SA2mjAoDx7g
// s8OIPLyzVyAjtCCAgAbPUlPszlgihpqLzLCWaVCz8SsnyRTPAhG6rxIyWEtuqKT1
// vv9+JMZSx5LEdntXryOONZRXeVrSUcCLdv8NHIT8+yBnm9ny+bCt0k2XU/KOlyay
// lHxtQ5HJVX9UZJnbgIoc16eZWqTSn4X10t7YeMczO/K9VBBYLzEoOIQwbaZ2C5Lt
// yvk4kS5xaXZigwAzLwoTRG/bBVCkZk4CR87R6kQBoUps7MWe+FLWTfeO842xIFkn
// 5ECRVJz+EqoOWvrK2g==
// -----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const jwksClient = require('jwks-rsa')
  const client = jwksClient({
    jwksUri: jwksUrl
  })

  const { kid } = jwt.header
  const key = await client.getSigningKey(kid)
  const signingKey = key.getPublicKey()
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, signingKey, {algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
