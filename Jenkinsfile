pipeline {
  agent any
  //using node js tool
  tools {nodejs "node"}
  
  //deploy integration test stages
  stages {
    //create build stage
    stage('Build') {
      steps {
        //Connect to github repository via user credentials, connects to main branch
        git branch: 'main', credentialsId: 'a08d586e-3ea7-4f31-b74f-ad42922f6d6c', url: 'https://github.com/gfdb/soen390.git'
        
        //start windows command to install node modules
        bat 'npm install'
      }
        
    }
    //test stage
    stage('Test'){
        steps{
          //run integration tests from github files
            echo 'Testing app'
            bat 'npm run testsuite'
        }
    }
    
    stage('Deploy'){
        steps{
          //reach this stage when all tests are successful
            echo 'Deploy app'
        }
    }
      
  }
  post{
    //if a failure/errors happens within the build jenkins will notify
    failure{
        echo 'tests have failed'
    }
  }
    
}
