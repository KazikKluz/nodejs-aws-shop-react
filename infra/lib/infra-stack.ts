import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

import * as cloudFront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudFrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';

import type { Construct } from 'constructs';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ID = 'rs-school-aws-shop-kazikkluz';

    const rsschoolawsshopkazikkluz = new s3.Bucket(this, `${ID}-s3.Bucket`, {
      publicReadAccess: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      bucketName: ID,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      websiteIndexDocument: 'index.html',
    });

    const oai = new cloudFront.OriginAccessIdentity(
      this,
      `${ID}-cloudFront.OriginAccessIdentity`,
      {
        comment: 'cloudfront access to the webstie bucket',
      }
    );

    rsschoolawsshopkazikkluz.grantRead(oai);

    const distribution = new cloudFront.Distribution(this, `${ID}-CloudFront`, {
      defaultBehavior: {
        origin: cloudFrontOrigins.S3BucketOrigin.withOriginAccessIdentity(
          rsschoolawsshopkazikkluz,
          {
            originAccessIdentity: oai,
          }
        ),
        viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudFront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new s3deploy.BucketDeployment(this, `${ID}-s3deploy.BucketDeployment`, {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: rsschoolawsshopkazikkluz,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, `${ID}-bucket-URL`, {
      value: rsschoolawsshopkazikkluz.bucketWebsiteDomainName,
    });

    new cdk.CfnOutput(this, `${ID}-cloudFront.CfnOutput`, {
      value: distribution.distributionDomainName,
    });
  }
}
