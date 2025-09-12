import { NextRequest, NextResponse } from 'next/server';

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  batchNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily';
  updatedAt: Date;
}

// Mock notification settings data
let mockSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  inAppEnabled: true,
  batchNotifications: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  },
  frequency: 'immediate',
  updatedAt: new Date('2024-01-15T12:00:00Z')
};

// GET notification settings
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockSettings
    });

  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT update notification settings
export async function PUT(request: NextRequest) {
  try {
    const settingsData = await request.json();

    // Validate required fields
    const requiredFields = ['emailEnabled', 'smsEnabled', 'inAppEnabled', 'batchNotifications', 'frequency'];
    for (const field of requiredFields) {
      if (settingsData[field] === undefined) {
        return NextResponse.json(
          {
            success: false,
            error: `${field} is required`
          },
          { status: 400 }
        );
      }
    }

    // Validate frequency value
    const validFrequencies = ['immediate', 'hourly', 'daily'];
    if (!validFrequencies.includes(settingsData.frequency)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid frequency value'
        },
        { status: 400 }
      );
    }

    // Validate quiet hours if enabled
    if (settingsData.quietHours?.enabled) {
      if (!settingsData.quietHours.start || !settingsData.quietHours.end) {
        return NextResponse.json(
          {
            success: false,
            error: 'Quiet hours start and end times are required when enabled'
          },
          { status: 400 }
        );
      }

      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(settingsData.quietHours.start) || !timeRegex.test(settingsData.quietHours.end)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid time format. Use HH:MM format'
          },
          { status: 400 }
        );
      }
    }

    // Update settings
    mockSettings = {
      ...settingsData,
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: mockSettings,
      message: 'Notification settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
