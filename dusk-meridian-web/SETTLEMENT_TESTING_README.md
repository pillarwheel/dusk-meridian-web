# Settlement 21 Testing Dashboard

This document describes the front-end implementation for testing the Settlement 21 character action system.

## Overview

The Settlement Testing Dashboard provides a comprehensive interface for monitoring and controlling the Settlement 21 system with 601 characters across 14 buildings. It integrates with the Settlement 21 Character Action System API endpoints for real-time testing and visualization.

## Features

### 🎛️ Control Panel
- **Start Interactions**: Trigger character-to-building interactions
- **Process Behaviors**: Execute daily AI behavior schedules
- **Real-time Monitoring**: Live activity polling with configurable intervals
- **Settlement Reset**: Reset all character actions for testing scenarios

### 📊 Real-time Statistics
- **Character Count**: Monitor all 601 characters in Settlement 21
- **Building Activity**: Track interactions across 14 building types
- **Active Characters**: See characters currently performing actions
- **Actions per Hour**: Monitor system throughput

### 📈 Visualizations
- **Character Role Distribution**: Visual breakdown of 7 character types
  - Blacksmith, Farmer, Merchant, Religious, Fisher, Crafter, Worker
- **Building Interaction Heatmap**: Most active buildings in real-time
- **Activity Breakdown**: Working, Moving, Resting, Socializing states
- **Character Movement Map**: 2D visualization with building positions

### 🔧 Configuration Options
- **Poll Interval**: Adjust real-time update frequency (1-30 seconds)
- **Time Multiplier**: Control simulation speed (0.1x - 10x)
- **Batch Size**: Configure character processing batches (10-100)
- **Auto Refresh**: Toggle automatic data updates

## API Endpoints Integration

The dashboard integrates with these Settlement 21 API endpoints:

```typescript
// Settlement Overview
GET /api/v1/settlement-test/settlement-21/overview

// Character Interactions
POST /api/v1/settlement-test/settlement-21/start-interactions

// AI Behavior Processing
POST /api/v1/settlement-test/settlement-21/process-behaviors

// Activity Monitoring
GET /api/v1/settlement-test/settlement-21/activity-summary

// Character Details
GET /api/v1/settlement-test/settlement-21/character/{id}

// System Reset
POST /api/v1/settlement-test/settlement-21/reset
```

## Character Role Patterns

The system implements these building interaction patterns:

### Character Types & Building Preferences
- **Blacksmith**: Blacksmith → Barn → General Store → Well → Workshop
- **Farmer**: Farmhouse → Barn → Workshop → Well → Fishery → Granary → General Store
- **Merchant**: General Store → Tailor Shop → Town Hall → Well
- **Religious**: Church → Shrine → General Store → Well
- **Fisher**: Fishery → General Store → Well → Granary
- **Crafter**: Workshop → General Store → Well → Tailor Shop
- **Worker**: General Store → Well → Workshop → Barn

### Daily Schedule Implementation
- **4-6 AM**: Early workers (Farmers, Fishers) start preparation
- **6-8 AM**: General morning preparation and workshop setup
- **8-12 PM**: Primary work activities (Crafting, Farming, Trading)
- **12-13 PM**: Lunch breaks and rest periods
- **13-17 PM**: Afternoon work continuation
- **17-19 PM**: Evening tasks and social activities
- **19-22 PM**: Personal time and community interaction
- **22-6 AM**: Sleep cycles

## Building Types

Settlement 21 includes these 14 building types:
- Town Hall, General Store, Blacksmith, Farmhouse
- Church, Barn, Workshop, Well, Shrine
- Fishery, Granary, Tailor Shop, Brewery

## Usage Instructions

### 1. Access the Dashboard
Navigate to `/settlement/testing` in your Dusk Meridian web application.

### 2. Monitor Settlement Status
- View real-time statistics for all 601 characters
- Check building activity distribution
- Monitor active character counts

### 3. Control Character Actions
- Click "Start Interactions" to trigger building interactions
- Use "Process Behaviors" to advance daily AI schedules
- Adjust time multiplier for faster/slower simulation

### 4. Real-time Monitoring
- Toggle "Start Monitoring" for live activity updates
- Configure poll interval (default: 5 seconds)
- View activity log for detailed event tracking

### 5. Character Visualization
- Switch to detailed view for character movement visualization
- Hover over characters to see individual status
- Filter by character role for focused monitoring

### 6. Performance Testing
- Use "Reset Settlement" to return to baseline state
- Configure batch processing size for performance testing
- Monitor processing times and system responsiveness

## Technical Implementation

### Components
- `SettlementTestDashboard.tsx`: Main dashboard interface
- `CharacterVisualization.tsx`: 2D character movement visualization
- `settlementTestService.ts`: API service layer

### State Management
- Real-time data polling with configurable intervals
- Error handling and loading states
- Activity logging for debugging and monitoring

### Performance Optimization
- Batch character processing (25-50 characters per operation)
- Async operations for non-blocking UI
- Efficient polling with cleanup on unmount
- Sample data visualization (50 characters) for performance

## Environment Configuration

Ensure your `.env` file includes:

```bash
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SETTLEMENT_API_URL=http://localhost:5000
```

## Testing Scenarios

### 1. Basic Functionality Test
1. Load dashboard and verify 601 character count
2. Start interactions and verify activity increase
3. Process behaviors and check AI schedule execution
4. Monitor building interaction patterns

### 2. Performance Testing
1. Set batch size to maximum (100 characters)
2. Process behaviors continuously for 10 minutes
3. Monitor system response times and error rates
4. Verify no memory leaks in real-time monitoring

### 3. AI Behavior Validation
1. Set time multiplier to 10x for accelerated testing
2. Process full 24-hour cycle (2.4 minutes real time)
3. Verify character role patterns match expected behavior
4. Check building usage reflects realistic settlement activity

### 4. System Reset and Recovery
1. Run intensive interactions for extended period
2. Use system reset to return to baseline
3. Verify all characters return to idle state
4. Confirm system responsiveness after reset

## Troubleshooting

### Common Issues
1. **Blank Dashboard**: Check API URL in environment configuration
2. **Failed API Calls**: Ensure Settlement 21 backend is running on correct port
3. **Performance Issues**: Reduce batch size and poll interval
4. **Character Data Not Loading**: Verify database has 601 characters in Settlement 21

### Debug Features
- Activity log shows detailed API call results
- Error messages display specific failure reasons
- Processing times visible for performance monitoring
- Character count validation against expected 601

## Architecture Benefits

### Game Integration Ready
- Compatible with existing pathfinding system
- Uses established database models
- Integrates with action queue processing
- Supports both Unity and web client interaction

### Scalable Design
- Handles 601 characters without performance degradation
- Configurable behavior schedules and interaction patterns
- Real-time monitoring with minimal server impact
- Batch processing optimizes database operations

This testing dashboard provides comprehensive validation for the Settlement 21 character action system, enabling thorough testing of realistic settlement simulation with 601 characters across 14 buildings.