dev:
	@component build -d -w --prefix 'last 2 versions'

standalone:
	@component build --prefix 'last 2 versions' --standalone clockpicker
