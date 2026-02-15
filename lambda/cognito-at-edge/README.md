# Cognito at Edge with IAM Auth

CloudFront + Lambda@Edge でCognito認証を行い、バックエンドLambdaへIAM署名付きリクエストを転送します。

See: https://github.com/awslabs/cognito-at-edge

> [!IMPORTANT]
> **Lambda@Edgeは us-east-1 にデプロイすること**

## アーキテクチャ

```
User → CloudFront → Lambda@Edge (Cognito認証 + IAM署名) → Backend Lambda
```

## セットアップ手順

### CloudFront

CloudFrontのFree-tierだとLambda@Edgeは利用できないので、従量課金を設定すること（ProやEnterpriseプランは未検証）。

- CloudFront Distributionを作成
    - OriginはバックエンドLambdaのFunction URL（存在しない場合は、適当に作って向ける）
    - Viewer Protocol Policyは「Redirect HTTP to HTTPS」
    - キャッシュポリシーは認証が必要なパスはキャッシュ無効化推奨
- Origin access controlの作成
    - Origin access controlを作成し、CloudFrontからLambdaへのリクエストに署名を付与する設定を行う
    - 署名方法は「署名リクエスト」
    - オリジンタイプは「Lambda」
- オリジンを編集
    - Origin access controlで先ほど作成したものを選択
    - 記載されているAWS Commandsを実行して、LambdaのリソースベースポリシーにCloudFrontからのアクセス許可を追加する（本当に実行したいLambdaに対して向けるので、適当に作った場合は後で変えること）

### Cognito

- アプリケーションタイプ
    - シングルページアプリケーション (SPA) で作成
        - シングルページアプリケーション (SPA) はClient Secret無しで作成可能
        - 従来のウェブアプリケーション はClient Secretが発行される
- マネージドログインページを編集
    - 許可されているコールバック URLにCloudFrontのドメインを指定（例: `https://<CLOUDFRONT_DOMAIN>.cloudfront.net` と `https://<CLOUDFRONT_DOMAIN>.cloudfront.net/_callback` の両方）

### IAM Role for Lambda@Edge

#### Trust Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

#### Permissions Policy
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "logs:CreateLogGroup",
      "Resource": "arn:aws:logs:*:ACCOUNT_ID:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": [
        "arn:aws:logs:*:ACCOUNT_ID:log-group:/aws/lambda/FUNCTION_NAME:*",
        "arn:aws:logs:*:ACCOUNT_ID:log-group:/aws/lambda/us-east-1.FUNCTION_NAME:*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:REGION:ACCOUNT_ID:function:BACKEND_FUNCTION_NAME"
    }
  ]
}
```

> [!IMPORTANT]
> - ログリソースは **全リージョン (`*`)** 対応が必須（Lambda@Edgeは複数リージョンで実行される）
> - `us-east-1` のみだと他リージョンでログ出力に失敗し、503エラーになる

### Lambda@Edge

#### 環境変数設定

`.env` ファイルを作成

```bash
AWS_REGION="'ap-northeast-1'"
USER_POOL_ID="'example-user-pool-id'" # e.g. 'ap-northeast-1_HOGehoge'
USER_POOL_APP_ID="'example-user-pool-app-id'" # e.g. 'hereisrandomstringwithnumbers'
USER_POOL_DOMAIN="'example-user-pool-domain'" # e.g. 'ap-northeast-1hogehoge.auth.ap-northeast-1.amazoncognito.com'
TARGET_LAMBDA_REGION="'ap-northeast-1'"
```

```bash
$ make build
```

zipをアップロードして、ConsoleからLambda@Edgeにデプロイして紐づける
「Viewer Request」で紐づけると、CloudFrontのリクエストが来るたびにLambda@Edgeが実行されるようになる

## 参考リンク
- [cognito-at-edge](https://github.com/awslabs/cognito-at-edge)
- [CloudFront + Lambda 関数 URL 構成でPOST/PUT リクエストを行うために Lambda@Edge でSigv4署名する](https://dev.classmethod.jp/articles/cloudfront-lambda-url-sigv4-signer/)
