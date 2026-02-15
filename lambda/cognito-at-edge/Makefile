include .env

.PHONY: build .FORCE
build: lambda.zip

.FORCE:

# if replace on command-line: make build AWS_REGION="\'ap-northeast-1\'"
dist/index.mjs: .env index.mts .FORCE
	@pnpm exec esbuild --bundle index.mts --platform=node --target=node24 --format=esm \
		--main-fields=module,main \
		--banner:js="import { fileURLToPath } from 'url'; import { createRequire } from 'module'; const require = createRequire(import.meta.url); const __filename = fileURLToPath(import.meta.url); const __dirname = require('path').dirname(__filename);" \
		--define:process.env.AWS_REGION=$(AWS_REGION) \
		--define:process.env.USER_POOL_ID=$(USER_POOL_ID) \
		--define:process.env.USER_POOL_APP_ID=$(USER_POOL_APP_ID) \
		--define:process.env.USER_POOL_DOMAIN=$(USER_POOL_DOMAIN) \
		--define:process.env.TARGET_LAMBDA_REGION=$(TARGET_LAMBDA_REGION) \
		--outfile=dist/index.mjs

lambda.zip: dist/index.mjs package.json
	@rm -f $@
	@cp package.json dist
	@cd dist && zip -r ../$@ index.mjs package.json
