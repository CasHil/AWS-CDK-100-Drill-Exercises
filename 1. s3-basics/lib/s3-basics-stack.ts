import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs/lib";

export class S3BasicStack extends cdk.Stack {
  public readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "VersioningEnabled", {
      versioned: true,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      lifecycleRules: [
        {
          id: "ExpireNonCurrentVersionsAfter90Days",
          enabled: true,
          noncurrentVersionExpiration: cdk.Duration.days(90),
          noncurrentVersionsToRetain: 3,
        },
        {
          id: "NonCurrentVersionTransitionToIAAfter30Days",
          enabled: true,
          noncurrentVersionTransitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
        },
        {
          id: "CurrentVersionTransitionToIAAfter60Days",
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(60),
            },
          ],
        },
        {
          id: "CurrentVersionTransitionToGlacierAfter90Days",
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
        {
          id: "ExpireCurrentVersionsAfter365Days",
          enabled: true,
          expiration: cdk.Duration.days(365),
        },
        {
          id: "AbortIncompleteMultipartUploadsAfter7Days",
          enabled: true,
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
    });
  }
}
