import os
import sys
import json
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Add parent directory to path to import local modules if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

def setup_s3():
    bucket_name = os.getenv('AWS_STORAGE_BUCKET_NAME')
    region = os.getenv('AWS_S3_REGION_NAME', 'eu-north-1')
    access_key = os.getenv('AWS_ACCESS_KEY_ID')
    secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

    if not all([bucket_name, access_key, secret_key]):
        print("Error: AWS_STORAGE_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY must be set in .env")
        return

    s3_client = boto3.client(
        's3',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=region
    )

    # 1. Create Bucket
    try:
        if region == 'us-east-1':
            s3_client.create_bucket(Bucket=bucket_name)
        else:
            s3_client.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={'LocationConstraint': region}
            )
        print(f"Successfully created bucket: {bucket_name}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'BucketAlreadyOwnedByYou':
            print(f"Bucket {bucket_name} already exists and is owned by you.")
        elif e.response['Error']['Code'] == 'BucketAlreadyExists':
            print(f"Bucket name {bucket_name} is already taken globally. Please choose a different name.")
            return
        else:
            print(f"Error creating bucket: {e}")
            return

    # 2. Disable Block Public Access
    try:
        s3_client.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )
        print("Disabled Block Public Access.")
    except ClientError as e:
        print(f"Error disabling block public access: {e}")

    # 3. Set Bucket Policy for Public Read
    bucket_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": f"arn:aws:s3:::{bucket_name}/*"
            }
        ]
    }
    
    try:
        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(bucket_policy)
        )
        print("Set bucket policy for public read.")
    except ClientError as e:
        print(f"Error setting bucket policy: {e}")

    # 4. Configure CORS
    cors_configuration = {
        'CORSRules': [{
            'AllowedHeaders': ['*'],
            'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            'AllowedOrigins': ['*'], # In production, restrict this to your domain
            'ExposeHeaders': ['ETag']
        }]
    }

    try:
        s3_client.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )
        print("Configured CORS settings.")
    except ClientError as e:
        print(f"Error configuring CORS: {e}")

    print("\nS3 Setup Complete!")
    print(f"Bucket URL: https://{bucket_name}.s3.{region}.amazonaws.com/")

if __name__ == "__main__":
    setup_s3()
