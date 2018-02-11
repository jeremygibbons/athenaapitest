import boto3
import json
import datetime

def apiresponse(message, status_code):  
    return {
        'isBase64Encoded' : 'false',
        'statusCode': str(status_code),
        'body': json.dumps(message),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
            },
        }


def lambda_handler(event, context):
    client = boto3.client('athena')
    response = client.get_query_results(
        QueryExecutionId=event['queryStringParameters']['queryId']
    )
    return apiresponse(response, 200)
