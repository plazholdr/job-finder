import React from 'react';
import { Typography, Row, Col, Card, Divider } from 'antd';
import FilterBar from '../FilterBar';
import { getFilterConfig } from '../filterConfigs';
import { useFilters } from '../../hooks/useFilters';

const InternSearchExample = () => {
  // Initialize filter configuration for intern search (matches real data structure)
  const filterConfig = getFilterConfig('intern-search');

  // Initialize filter state with actual data fields
  const {
    filters: selectedFilters,
    updateFilter: handleFilterChange,
    clearAllFilters: handleClearAllFilters,
    hasActiveFilters,
    toURLSearchParams,
    toAPIQuery
  } = useFilters({
    fieldOfStudy: [],        // Maps to educations.fieldOfStudy
    educationLevel: [],      // Maps to educations.level
    university: [],          // Maps to educations.institutionName
    workExperience: [],      // Maps to workExperiences.industry
    skills: [],              // Maps to skills.name
    preferredLocations: []   // Maps to preferences.locations
  });

  // Handle save profile (optional)
  const handleSaveProfile = () => {
    console.log('Saving intern search profile:', selectedFilters);
    // Implement your save logic here
  };

  // Convert filters to API query for intern search (matches backend expectations)
  const apiQuery = toAPIQuery({
    fieldOfStudy: 'fieldOfStudy',
    educationLevel: 'educationLevel',
    university: 'university',
    workExperience: 'workIndustry',
    skills: 'skills',
    preferredLocations: 'preferredLocation'
  });

  console.log('Intern Search API Query:', apiQuery);

  // Example of how the data structure looks
  const exampleStudentData = {
    "_id": "68d76f4e5581377e47bc3f95",
    "email": "aaron.riang99@gmail.com",
    "role": "student",
    "profile": {
      "firstName": "Aaron",
      "lastName": "Jose",
      "phone": "01116025564"
    },
    "educations": [
      {
        "level": "Degree",
        "institutionName": "Swinburne University",
        "fieldOfStudy": "Bachelor of Computer Science"
      }
    ],
    "workExperiences": [
      {
        "companyName": "Siroi Solutions",
        "industry": "Technology",
        "jobTitle": "Software Engineer"
      }
    ],
    "skills": [
      { "name": "JavaScript" },
      { "name": "React" }
    ],
    "preferences": {
      "locations": ["Kuala Lumpur", "Selangor"]
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Typography.Title level={2}>Intern Search with Real Data Structure</Typography.Title>

      {/* Reusable Filter Bar */}
      <FilterBar
        filterConfig={filterConfig}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAllFilters}
        onSaveProfile={handleSaveProfile}
        showSaveProfile={true}
        showClearAll={true}
        theme={{
          activeColor: '#7d69ff',
          inactiveColor: '#f5f5f5',
          textColor: '#666',
          activeTextColor: '#fff'
        }}
      />

      {/* Results Section */}
      <Card>
        <Typography.Title level={4}>Filter Results</Typography.Title>
        <Typography.Text>
          Active filters: {hasActiveFilters ? 'Yes' : 'No'}
        </Typography.Text>

        <Divider />

        <Typography.Title level={5}>API Query Parameters:</Typography.Title>
        <Typography.Text code style={{ display: 'block', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(apiQuery, null, 2)}
        </Typography.Text>

        <Divider />

        <Typography.Title level={5}>Example Student Data Structure:</Typography.Title>
        <Typography.Text code style={{ display: 'block', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          {JSON.stringify(exampleStudentData, null, 2)}
        </Typography.Text>

        <Divider />

        {/* Your intern results would go here */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: '#fafafa',
              borderRadius: '8px'
            }}>
              <Typography.Title level={4}>Filtered Intern Results</Typography.Title>
              <Typography.Text>
                Intern profiles matching the selected filters would appear here.
                <br />
                The filters now correctly map to the actual data structure:
                <br />
                • Field of Study → educations.fieldOfStudy
                <br />
                • Education Level → educations.level
                <br />
                • University → educations.institutionName
                <br />
                • Work Experience → workExperiences.industry
                <br />
                • Skills → skills.name
                <br />
                • Preferred Locations → preferences.locations
              </Typography.Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InternSearchExample;
