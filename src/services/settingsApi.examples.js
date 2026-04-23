/**
 * EXAMPLE API REQUESTS AND RESPONSES
 * 
 * This file documents the Settings API interactions for reference.
 * 
 * 1. GET /settings/profile
 *    Description: Get all organization profile settings
 *    Headers: { 
 *      Authorization: "Bearer <token>", 
 *      x-org-id: "org-123" 
 *    }
 *    
 *    Response (200 OK):
 *    {
 *      "name": "ABC Pvt Ltd",
 *      "logo": "https://cdn.example.com/logo.png",
 *      "timezone": "Asia/Kolkata",
 *      "currency": "INR",
 *      "dateFormat": "DD/MM/YYYY",
 *      "language": "en"
 *    }
 * 
 * 2. POST /settings/profile
 *    Description: Update organization profile settings (batch update)
 *    Headers: { 
 *      Authorization: "Bearer <token>", 
 *      x-org-id: "org-123" 
 *    }
 *    Request Body: {
 *      "name": "New Company Name",
 *      "timezone": "America/New_York"
 *    }
 *    
 *    Response (200 OK):
 *    {
 *      "message": "Profile updated successfully",
 *      "updates": {
 *        "org.name": "New Company Name",
 *        "org.timezone": "America/New_York"
 *      }
 *    }
 * 
 * 3. GET /settings
 *    Description: Get all settings (raw key-value pairs)
 *    Headers: { 
 *      Authorization: "Bearer <token>", 
 *      x-org-id: "org-123" 
 *    }
 *    
 *    Response (200 OK):
 *    [
 *      {
 *        "id": "setting-1",
 *        "key": "org.name",
 *        "value": "ABC Pvt Ltd",
 *        "createdAt": "2024-01-01T00:00:00.000Z",
 *        "updatedAt": "2024-01-01T00:00:00.000Z"
 *      },
 *      {
 *        "id": "setting-2",
 *        "key": "org.timezone",
 *        "value": "Asia/Kolkata",
 *        "createdAt": "2024-01-01T00:00:00.000Z",
 *        "updatedAt": "2024-01-01T00:00:00.000Z"
 *      }
 *    ]
 * 
 * 4. GET /settings/:key
 *    Description: Get a specific setting by key
 *    Headers: { 
 *      Authorization: "Bearer <token>", 
 *      x-org-id: "org-123" 
 *    }
 *    Example: GET /settings/org.name
 *    
 *    Response (200 OK):
 *    {
 *      "id": "setting-1",
 *      "key": "org.name",
 *      "value": "ABC Pvt Ltd",
 *      "createdAt": "2024-01-01T00:00:00.000Z",
 *      "updatedAt": "2024-01-01T00:00:00.000Z"
 *    }
 * 
 * 5. POST /settings
 *    Description: Create or update a single setting
 *    Headers: { 
 *      Authorization: "Bearer <token>", 
 *      x-org-id: "org-123" 
 *    }
 *    Request Body: {
 *      "key": "org.logo",
 *      "value": "https://cdn.example.com/new-logo.png"
 *    }
 *    
 *    Response (200 OK):
 *    {
 *      "id": "setting-456",
 *      "key": "org.logo",
 *      "value": "https://cdn.example.com/new-logo.png",
 *      "createdAt": "2024-01-01T00:00:00.000Z",
 *      "updatedAt": "2024-01-01T00:00:00.000Z"
 *    }
 * 
 * ERROR RESPONSES:
 * 
 * 400 Bad Request:
 * {
 *   "statusCode": 400,
 *   "message": ["key should not be empty", "value should not be empty"],
 *   "error": "Bad Request"
 * }
 * 
 * 401 Unauthorized:
 * {
 *   "statusCode": 401,
 *   "message": "Unauthorized",
 *   "error": "Unauthorized"
 * }
 * 
 * 404 Not Found:
 * {
 *   "statusCode": 404,
 *   "message": "Setting 'org.invalid_key' not found",
 *   "error": "Not Found"
 * }
 * 
 * MULTI-TENANT SUPPORT:
 * 
 * The x-org-id header is required for all settings endpoints.
 * The backend uses this to resolve the correct tenant database.
 * 
 * Example organization IDs:
 * - "550e8400-e29b-41d4-a716-446655440000" (UUID format)
 * 
 * FRONTEND USAGE:
 * 
 * // Using the custom hook
 * const { settings, isLoading, error, updateSettings, isUpdating } = useSettings(
 *   accessToken,
 *   organizationId
 * );
 * 
 * // Updating settings
 * await updateSettings({
 *   name: 'New Company Name',
 *   timezone: 'America/New_York',
 *   currency: 'USD'
 * });
 * 
 * // The hook automatically:
 * // 1. Converts form data to backend format
 * // 2. Sends the request with proper headers
 * // 3. Refetches settings after successful update
 * // 4. Handles loading and error states
 */
