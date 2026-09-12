const { execSync } = require('child_process');

try {
  console.log('🔄 Syncing theme directory to GitHub theme branch...');

  // 1. Commit any uncommitted theme edits
  try {
    execSync('git add theme/ && git commit -m "update: theme storefront modifications"', { stdio: 'ignore' });
  } catch (e) {
    // No changes to commit
  }

  // 2. Delete temporary branch if it existed
  try {
    execSync('git branch -D theme-sync', { stdio: 'ignore' });
  } catch (e) {}

  // 3. Extract the theme folder into a standalone root branch
  execSync('git subtree split --prefix=theme -b theme-sync', { stdio: 'inherit' });

  // 4. Push directly to the remote theme branch
  console.log('🚀 Pushing theme directly to GitHub (branch: theme)...');
  execSync('git push origin theme-sync:theme --force', { stdio: 'inherit' });

  // 5. Clean up temporary local branch
  execSync('git branch -D theme-sync', { stdio: 'ignore' });

  console.log('');
  console.log('✅ Success! Your GitHub "theme" branch is updated.');
  console.log('👉 Shopify will automatically fetch and apply changes to your live storefront in seconds!');
} catch (err) {
  console.error('❌ Theme sync failed:', err.message);
}
