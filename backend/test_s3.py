
import os
import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

# Load from .env manually to be sure
from dotenv import load_dotenv
load_dotenv('.env')

aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
region_name = os.getenv('AWS_S3_REGION_NAME', 'ap-south-1')

print(f"Bucket: {bucket_name}, Region: {region_name}")

try:
    s3 = boto3.client(
        's3',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=region_name
    )
    
    # Try to list objects
    response = s3.list_objects_v2(Bucket=bucket_name)
    print("Successfully connected to S3!")
    print(f"Object count: {response.get('KeyCount', 0)}")
    
    # Try to upload a small dummy file
    s3.put_object(Bucket=bucket_name, Key='test_connection.txt', Body='Hello S3')
    print("Successfully uploaded test file!")
    
except Exception as e:
    print(f"Error: {e}")
