# AWS-S3-Analytics tool
## Why
This shell tool was created for the purpose of fulfilling [this very challenge](https://github.com/coveo/devops-coding-challenge).

## What does it run on?
The tool was developed in JavaScript (NodeJS, ECMAScript2016 - compiled with Babel). It uses the AWS JavaScript SDK and other useful NodeJS open-source tools. Although it was developed on OSX, it has been packaged with [pkg](https://www.npmjs.com/package/pkg) and runs on Windows, Linux and OSX.

## How to install
1. Simply go to the [release section](https://github.com/delirius325/aws-s3-analytics/releases)
2. Download the CLI according to your OS 
3. Open up a terminal (or PowerShell, or GitBash, or CIGWYN, etc.) 
4. ```cd``` to where you downloaded the CLI tool
5. Execute the binary of your choice - command examples below.

## Commands
### Credentials
To be able to use the tool, you'll first have to set your AWS credentials. This is easily done with the following command.

**_NOTICE: It is possible to skip this whole process by setting the following environment variables: `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`_**
```shell
./s3-analytics-[yourOS] creds

# You will be prompted to enter your AWS_ACCESS_KEY_ID
# Then your AWS_SECRET_ACCESS_KEY
# ** Please note that copy pasta is allowed for ease of use **
```
### Buckets
#### Detailed list
To show a detailed table of every bucket
```shell
./s3-analytics-[yourOS] list

# --sort, -s : Sorts the table by the specified parameter
# --order, -o : Orders the table ascendingly or descendingly
# --filter, -f : Filters the table by the specified string or regexp

```
#### Specific bucket
To show basic information related to a specific bucket
```shell
./s3-analytics-[yourOS] show -b REQUIRED_BUCKET_NAME
```
### Cost and usage
It is possible to list the cost and usage of every usage type per region.
```shell
./s3-analytics-[yourOS] cost [-r (defaults to us-east-1)]

# optional parameters
# --start, -st : Start date in YYYY-MM-DD format
# --end, -e : End date in YYYY-MM-DD format
```

It is also possible to see the projected total cost for the current month, per specified region.
```shell
./s3-analytics-[yourOS] cost-projection [-r (defaults to us-east-1)]
```
### Objects
To list objects within a bucket
```shell
./s3-analytics-[yourOS] objects -b REQUIRED_BUCKET_NAME 

# optional parameters
# --sort, -s : Sorts the table by the specified parameter
# --order, -o : Orders the table ascendingly or descendingly
# --storage, --type, -t : Filters the table by the specified type
# --filter, -f : Filters the table by the specified string or regexp
```
### Help
For additionnal help (argument choices, etc.)
```shell
./s3-analytics-[yourOS] help
# or
./s3-analytics-[yourOS] [command] --help
```