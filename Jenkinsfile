pipeline {

    agent any

    parameters {
        string(
            name: 'target_hostname',
            defaultValue:"",
            description: "Name of the host to update tags for."
        )
    }
  
    stages {
        stage('Fetch latest tags') {
            
            environment {
                SPREADSHEET_ID = credentials('gsheet-tagfetch-spreadsheet-id')
                GOOGLE_APPLICATION_CREDENTIALS = credentials('gsheet-tagfetch-google-creds')
            }

            steps {

                sh '''
                    docker-compose                            \\
                        -f docker-compose.yml                 \\
                        run --sheet ${params.target_hostname} \\
                        -T --rm --no-deps tagfetch            \\
                    > tags.env                                \\
                    '''

                script { 
                    tags = readFile('tags.env')
                }
            }

        }

        stage('Trigger downstream deploy job') {
            steps {
                build(
                    job: 'ansible-deploy',
                    parameters: [
                        string(name: 'TARGET_HOST', value: '${params.target_hostname}' ),
                        string(name: 'tags', value: tags)
                    ]
                )
            }
        }
    }
}

