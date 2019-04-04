// this is your Android configuration file for Firebase-Admin and looks like the following

const serviceAccountData = {
  type: 'service_account',
  project_id: 'xxxxxxxxxx',
  private_key_id: 'xxxxxxxxxxxxxx',
  private_key: '-----BEGIN PRIVATE KEY-----xxxxxxxxxxxxxxxxx-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-dl1qn@axxxxxxxxxxxxxx.iam.gserviceaccount.com',
  client_id: '123456789',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dl1qn%40xxxxxxxxxxxxxxx.iam.gserviceaccount.com'
}

export { serviceAccountData }
