import { renderMediaOnLambda } from '@remotion/lambda/client';

// Import types from Remotion
import type { RenderMediaOnLambdaInput } from '@remotion/lambda/client';

// Re-export the render function with proper typing
export const getRenderFunction = async () => {
  return (options: RenderMediaOnLambdaInput) => {
    return renderMediaOnLambda({
      ...options,
      region: options.region,
      functionName: options.functionName,
      serveUrl: options.serveUrl,
    });
  };
}; 