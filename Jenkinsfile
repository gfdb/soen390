pipeline {
  agent any
  
  tools {nodejs "node"}
  
  stages {
    stage('Build') {
      steps {
        git branch: 'main', credentialsId: 'a08d586e-3ea7-4f31-b74f-ad42922f6d6c', url: 'https://github.com/gfdb/soen390.git'
        bat 'npm install'
      }
        
    }
    stage('Test'){
        steps{
            echo 'Testing app'
            bat 'npm test'
        }
    }
    
    stage('Deploy'){
        steps{
            echo 'Deploy app'
        }
    }
      
  }
    
}
