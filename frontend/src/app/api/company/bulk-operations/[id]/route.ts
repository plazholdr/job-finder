import { NextRequest, NextResponse } from 'next/server';

// Mock bulk operations data (same as in main route)
let mockBulkOperations = [
  {
    id: 'bulk-op-1',
    type: 'applications',
    action: 'update_status',
    targetIds: ['app-1', 'app-2', 'app-3'],
    parameters: {
      newStatus: 'reviewed',
      notes: 'Bulk review completed'
    },
    status: 'completed',
    progress: 100,
    results: {
      successful: 3,
      failed: 0,
      errors: []
    },
    createdBy: 'admin-user',
    createdAt: new Date('2024-01-22T10:00:00Z'),
    completedAt: new Date('2024-01-22T10:02:30Z'),
    estimatedDuration: 150
  }
];

// GET bulk operation status
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const operationId = params.id;
    
    const operation = mockBulkOperations.find(op => op.id === operationId);
    
    if (!operation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bulk operation not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: operation
    });

  } catch (error) {
    console.error('Error fetching bulk operation status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT update bulk operation (cancel, retry, etc.)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const operationId = params.id;
    const updateData = await request.json();
    
    const operationIndex = mockBulkOperations.findIndex(op => op.id === operationId);
    
    if (operationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bulk operation not found'
        },
        { status: 404 }
      );
    }

    const operation = mockBulkOperations[operationIndex];

    // Handle different update actions
    if (updateData.action === 'cancel') {
      if (operation.status === 'pending' || operation.status === 'in_progress') {
        operation.status = 'cancelled';
        operation.completedAt = new Date();
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot cancel operation that is already completed or failed'
          },
          { status: 400 }
        );
      }
    } else if (updateData.action === 'retry') {
      if (operation.status === 'failed' || operation.status === 'cancelled') {
        // Reset operation for retry
        operation.status = 'pending';
        operation.progress = 0;
        operation.results = {
          successful: 0,
          failed: 0,
          errors: []
        };
        operation.completedAt = undefined;
        operation.createdAt = new Date();
        
        // Start processing again
        setTimeout(() => {
          processBulkOperation(operationId);
        }, 1000);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Can only retry failed or cancelled operations'
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Supported actions: cancel, retry'
        },
        { status: 400 }
      );
    }

    mockBulkOperations[operationIndex] = operation;

    return NextResponse.json({
      success: true,
      data: operation,
      message: `Operation ${updateData.action}ed successfully`
    });

  } catch (error) {
    console.error('Error updating bulk operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// DELETE bulk operation (remove from history)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const operationId = params.id;
    
    const operationIndex = mockBulkOperations.findIndex(op => op.id === operationId);
    
    if (operationIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bulk operation not found'
        },
        { status: 404 }
      );
    }

    const operation = mockBulkOperations[operationIndex];

    // Only allow deletion of completed, failed, or cancelled operations
    if (operation.status === 'pending' || operation.status === 'in_progress') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete operation that is still running. Cancel it first.'
        },
        { status: 400 }
      );
    }

    // Remove from array
    mockBulkOperations.splice(operationIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Bulk operation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting bulk operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Simulate bulk operation processing (same as in main route)
async function processBulkOperation(operationId: string) {
  const operationIndex = mockBulkOperations.findIndex(op => op.id === operationId);
  if (operationIndex === -1) return;

  const operation = mockBulkOperations[operationIndex];
  
  // Update status to in_progress
  operation.status = 'in_progress';
  
  const totalItems = operation.targetIds.length;
  let processedItems = 0;
  let successfulItems = 0;
  let failedItems = 0;
  const errors: Array<{ targetId: string; error: string }> = [];

  // Simulate processing each item
  for (const targetId of operation.targetIds) {
    // Check if operation was cancelled
    if (operation.status === 'cancelled') {
      break;
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      successfulItems++;
    } else {
      failedItems++;
      errors.push({
        targetId,
        error: 'Simulated processing error'
      });
    }
    
    processedItems++;
    operation.progress = Math.round((processedItems / totalItems) * 100);
  }

  // Update final results
  if (operation.status !== 'cancelled') {
    operation.status = failedItems === 0 ? 'completed' : 'completed';
    operation.progress = 100;
  }
  
  operation.results = {
    successful: successfulItems,
    failed: failedItems,
    errors
  };
  operation.completedAt = new Date();

  mockBulkOperations[operationIndex] = operation;
}
