import boto3
import json

def apiresponse(message, status_code):  
    return {
        'isBase64Encoded' : 'false',
        'statusCode': str(status_code),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            },
        'body': json.dumps(message),
        }


def lambda_handler(event, context):
    client = boto3.client('athena')
    response = client.start_query_execution(
        QueryString=json.loads(event['body'])['query'],
        QueryExecutionContext={
            'Database': 'alabtest'
        },
        ResultConfiguration={
            'OutputLocation': 's3://jgi-testalab-results/results/'
        }
    )
    return apiresponse(response, 200)
    
