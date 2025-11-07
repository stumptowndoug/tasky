.PHONY: help install dev build lint lint-fix format typecheck mcp-build mcp-watch clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies (one-time setup)
	npm install
	npm run mcp:build
	@echo ''
	@echo '✅ Setup complete! Run "make dev" to start the app.'

dev: ## Start the development server and open browser
	npm run dev:open

build: ## Build the Next.js app for production
	npm run build

lint: ## Run ESLint to check for code issues
	npm run lint

lint-fix: ## Run ESLint and automatically fix issues
	npm run lint:fix

format: ## Format code with Prettier
	npm run format:write

typecheck: ## Run TypeScript type checking
	npm run typecheck

mcp-build: ## Build the MCP server
	npm run mcp:build

mcp-watch: ## Watch and rebuild MCP server on changes
	npm run mcp:watch

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules mcp-server/node_modules mcp-server/dist .next
	@echo '✅ Cleaned! Run "make install" to reinstall.'

.DEFAULT_GOAL := help
