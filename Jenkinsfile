pipeline {
  agent any
  parameters {
    string(name: 'PHONE_HOST', defaultValue: '100.72.142.120', description: 'Phone IP or Tailscale name')
    string(name: 'PHONE_USER', defaultValue: 'u0_a123', description: 'Output of whoami in Termux')
    string(name: 'PHONE_PORT', defaultValue: '8022', description: 'Termux sshd port')
  }
  environment {
    SSH = "-p ${params.PHONE_PORT} -o StrictHostKeyChecking=accept-new"
    TARGET = "${params.PHONE_USER}@${params.PHONE_HOST}"
  }
  stages {
    stage('Install') { steps { sh 'npm ci || npm install' } }
    stage('Build') {
      steps {
        sh 'npm run build'
        sh 'cp -r .next/static .next/standalone/.next/static'
        sh 'tar czf garage-drive.tgz -C .next/standalone .'
      }
    }
    stage('Deploy to phone') {
      steps {
        sshagent(credentials: ['phone-ssh']) {
          sh 'ssh $SSH $TARGET "mkdir -p ~/garage-drive"'
          sh 'scp -P ${PHONE_PORT} -o StrictHostKeyChecking=accept-new garage-drive.tgz deploy/start.sh $TARGET:~/garage-drive/'
          sh 'ssh $SSH $TARGET "bash ~/garage-drive/start.sh"'
        }
      }
    }
    stage('Smoke test') {
      steps { sh 'curl -fsS --retry 6 --retry-delay 3 --retry-connrefused -o /dev/null http://${PHONE_HOST}:3000/' }
    }
  }
  post {
    success { archiveArtifacts artifacts: 'garage-drive.tgz', fingerprint: true }
  }
}
