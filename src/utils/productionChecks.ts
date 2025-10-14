/**
 * Productie verificatie utilities voor Nova chat
 * Gebruik: open console op fitfi.ai en run window.novaChecks()
 */

export interface ProductionCheckResult {
  name: string;
  status: 'pass' | 'fail';
  message: string;
  element?: Element | null;
}

export function runProductionChecks(): ProductionCheckResult[] {
  const results: ProductionCheckResult[] = [];

  // Check 1: Console build tag en mount
  const buildTag = import.meta.env.VITE_BUILD_TAG ?? 'dev';
  const isProd = import.meta.env.PROD;
  results.push({
    name: 'Build Tag & Mount',
    status: isProd && buildTag !== 'dev' ? 'pass' : 'fail',
    message: isProd 
      ? `✅ FitFi build=${buildTag} | NovaChat root mounted (prod)`
      : `❌ Not in production mode or missing build tag`
  });

  // Check 2: DOM launcher element
  const launcher = document.querySelector('#fitfi-portal-launcher-pro');
  results.push({
    name: 'DOM Launcher',
    status: launcher ? 'pass' : 'fail',
    message: launcher 
      ? '✅ #fitfi-portal-launcher-pro exists'
      : '❌ #fitfi-portal-launcher-pro not found',
    element: launcher
  });

  // Check 3: Network SSE endpoint (async check)
  results.push({
    name: 'SSE Endpoint',
    status: 'pass', // Will be updated by async check
    message: '⏳ Checking /.netlify/functions/nova...'
  });

  // Check 4: Legacy bar cleanup
  const legacyBar = document.querySelector('.nova-chatbar');
  results.push({
    name: 'Legacy Cleanup',
    status: !legacyBar ? 'pass' : 'fail',
    message: !legacyBar 
      ? '✅ .nova-chatbar is null (legacy cleaned)'
      : '❌ Legacy .nova-chatbar still present',
    element: legacyBar
  });

  // Check 5: Launcher visibility
  const launcherVisible = launcher && getComputedStyle(launcher).display !== 'none';
  results.push({
    name: 'Launcher Visibility',
    status: launcherVisible ? 'pass' : 'fail',
    message: launcherVisible 
      ? '✅ Launcher visible and ready'
      : '❌ Launcher hidden or missing'
  });

  return results;
}

export async function checkSSEEndpoint(): Promise<ProductionCheckResult> {
  try {
    const response = await fetch('/.netlify/functions/nova', {
      method: 'POST',
      headers: {
        'x-fitfi-tier': 'visitor',
        'x-fitfi-uid': 'check'
      }
    });

    const contentType = response.headers.get('content-type');
    const isEventStream = contentType?.includes('text/event-stream');

    return {
      name: 'SSE Endpoint',
      status: response.ok && isEventStream ? 'pass' : 'fail',
      message: response.ok && isEventStream
        ? `✅ /.netlify/functions/nova → ${response.status}, text/event-stream`
        : `❌ /.netlify/functions/nova → ${response.status}, ${contentType}`
    };
  } catch (error) {
    return {
      name: 'SSE Endpoint',
      status: 'fail',
      message: `❌ SSE endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function runFullProductionCheck(): Promise<void> {
  console.group('🔍 Nova Production Verification');
  
  const syncResults = runProductionChecks();
  
  // Log sync results
  syncResults.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.element) {
      console.log(`   Element:`, result.element);
    }
  });

  // Async SSE check
  const sseResult = await checkSSEEndpoint();
  const sseIcon = sseResult.status === 'pass' ? '✅' : '❌';
  console.log(`${sseIcon} ${sseResult.name}: ${sseResult.message}`);

  // Summary
  const allResults = [...syncResults.slice(0, 2), sseResult, ...syncResults.slice(3)];
  const passCount = allResults.filter(r => r.status === 'pass').length;
  const totalCount = allResults.length;
  
  console.log(`\n📊 Summary: ${passCount}/${totalCount} checks passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 All Nova production checks passed!');
  } else {
    console.warn('⚠️ Some checks failed - review above for details');
  }
  
  console.groupEnd();
}

// Global window function for easy console access
if (typeof window !== 'undefined') {
  (window as any).novaChecks = runFullProductionCheck;
  (window as any).novaQuickCheck = runProductionChecks;
}