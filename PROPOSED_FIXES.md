# Proposed Fixes for Selected Potential Issues

This document outlines the proposed code changes to address PI-AUTH-001 and PI-TL-001.

---

## Fix for PI-AUTH-001: Case-Sensitive Email Check During Login

**Issue:** Users might be unable to log in if the case of their entered email does not exactly match the case used during registration (e.g., `User@example.com` vs `user@example.com`), because the email comparison in `MockAuthService.ts` is likely case-sensitive.

**Proposed Solution:**
The primary fix is to ensure that email comparisons in `MockAuthService.ts` are case-insensitive. This involves converting both the stored email and the input email to the same case (e.g., lowercase) before comparison in both the `login` and `register` (for checking existing users) functions.

Optionally, for a better user experience and consistency, email inputs in `LoginPage.tsx` and `RegistrationPage.tsx` could be normalized to lowercase either on input change or before submitting to `AuthContext`. However, the backend/service-level fix is crucial.

**Affected Files:**
- `src/services/MockAuthService.ts`
- Potentially `src/pages/LoginPage.tsx` (for client-side normalization - optional)
- Potentially `src/pages/RegistrationPage.tsx` (for client-side normalization - optional)

**Pseudo-code/Logic Description:**

**In `src/services/MockAuthService.ts`:**

```typescript
// Inside MockAuthService class

// For login
public async login(emailInput: string, passwordInput: string): Promise<User> {
  const normalizedEmailInput = emailInput.toLowerCase();
  const user = this.mockUsers.find(
    u => u.email.toLowerCase() === normalizedEmailInput && u.password === passwordInput
  );
  if (user) {
    return Promise.resolve(user);
  } else {
    return Promise.reject(new Error("Invalid email or password"));
  }
}

// For registration (when checking if user exists)
public async register(userData: NewUser): Promise<User> {
  const normalizedEmailInput = userData.email.toLowerCase();
  if (this.mockUsers.some(u => u.email.toLowerCase() === normalizedEmailInput)) {
    return Promise.reject(new Error("Email already exists"));
  }
  // ... rest of the registration logic, ensuring email is stored consistently (e.g., lowercase or as entered)
  // If storing as entered, the comparison must always be .toLowerCase() as above.
  // If choosing to store normalized email:
  const newUser: User = {
    id: Date.now().toString(),
    ...userData,
    email: normalizedEmailInput, // Store normalized email
    qrCodeData: `medimo://user?id=${Date.now().toString()}`, // Example
  };
  this.mockUsers.push(newUser);
  return Promise.resolve(newUser);
}
```

**In `src/pages/LoginPage.tsx` (Optional client-side normalization):**
```typescript
// Example for email input handling
const [email, setEmail] = useState('');

const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // setEmail(event.target.value.toLowerCase()); // Normalize on input
  setEmail(event.target.value); // Or normalize on submit
};

const handleLogin = async () => {
  // If not normalizing on input, normalize here before sending to context/service
  // const normalizedEmail = email.toLowerCase();
  // await authContext.login(normalizedEmail, password);
  await authContext.login(email, password); // Assuming service handles normalization
};
```
*Similar optional changes could be applied to `RegistrationPage.tsx`.*

---

## Fix for PI-TL-001: Timeline Client-Side Filtering Performance

**Issue:** The Timeline feature fetches all user events and performs filtering (keyword, category, date) on the client-side. This can lead to significant UI lag and poor performance with a large number of health events.

**Proposed Solution:**
The fix involves shifting the filtering logic from the client-side (`TimelineScreen.tsx`) to the data provider level (`HealthDataContext.tsx`). `HealthDataContext` will be modified to accept filter parameters in its data fetching methods (or new methods will be added). This simulates a backend that can filter data before sending it to the client, thus reducing the amount of data processed and rendered by `TimelineScreen.tsx`.

1.  **Modify `HealthDataContext.tsx`:**
    *   Update the `getTimelineEvents` method (or create a new `getFilteredTimelineEvents` method) to accept an optional `filters` object as a parameter. This object could contain properties like `keyword?: string`, `category?: string[]`, `dateRange?: { startDate?: Date, endDate?: Date }`, `sortOrder?: 'asc' | 'desc'`.
    *   Inside this method, the mock data (`this.mockTimelineEvents`) will be filtered based on these parameters *before* being returned.

2.  **Update `TimelineScreen.tsx`:**
    *   When filter controls change, `TimelineScreen.tsx` will now call the modified `getTimelineEvents` method in `HealthDataContext`, passing the current filter state.
    *   The component will then simply render the returned (pre-filtered) data, removing its own client-side filtering logic.

This approach mimics how a real application would offload filtering to a backend API.

**Affected Files:**
- `src/contexts/HealthDataContext.tsx`
- `src/pages/TimelineScreen.tsx`
- `src/types/index.ts` (potentially, to define the structure of the `filters` object)

**Conceptual Changes & Logic Description:**

**In `src/types/index.ts` (or a relevant types file):**
```typescript
export interface TimelineEventFilters {
  keyword?: string;
  categories?: string[]; // Assuming categories are strings
  dateRange?: {
    startDate?: Date;
    endDate?: Date;
  };
  sortOrder?: 'asc' | 'desc'; // For chronological or reverse-chronological
  // Add other filterable fields as necessary
}
```

**In `src/contexts/HealthDataContext.tsx`:**
```typescript
// Inside HealthDataContext class or provider logic

// Mock data - assuming it's an array of TimelineEvent objects
private mockTimelineEvents: TimelineEvent[] = [/* ... initial mock data ... */];

public async getTimelineEvents(filters?: TimelineEventFilters): Promise<TimelineEvent[]> {
  let events = [...this.mockTimelineEvents]; // Start with all events for the user

  if (filters) {
    if (filters.keyword) {
      const lowerKeyword = filters.keyword.toLowerCase();
      events = events.filter(event =>
        // Example: search in event title or description
        event.title.toLowerCase().includes(lowerKeyword) ||
        (event.description && event.description.toLowerCase().includes(lowerKeyword))
        // Add more searchable fields as needed
      );
    }

    if (filters.categories && filters.categories.length > 0) {
      events = events.filter(event =>
        filters.categories!.includes(event.category) // Assuming event has a 'category' field
      );
    }

    if (filters.dateRange) {
      if (filters.dateRange.startDate) {
        events = events.filter(event => event.date >= filters.dateRange!.startDate!);
      }
      if (filters.dateRange.endDate) {
        // Adjust for inclusive end date if needed (e.g., end of day)
        events = events.filter(event => event.date <= filters.dateRange!.endDate!);
      }
    }

    // Sorting (example: by date)
    events.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  } else {
    // Default sort if no filters or no sortOrder specified (e.g., newest first)
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return Promise.resolve(events);
}

// Other methods for adding/updating data would still add to the main mockTimelineEvents array.
// The filtering happens at the time of fetching for display.
```

**In `src/pages/TimelineScreen.tsx`:**
```typescript
// State for filters would remain similar
const [keyword, setKeyword] = useState('');
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
// ... other filter states

const { getTimelineEvents } = useContext(HealthDataContext); // Assuming context provides this
const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

// Debounced function to fetch filtered events
const fetchFilteredEvents = useCallback(debounce(async (currentFilters: TimelineEventFilters) => {
  try {
    const events = await getTimelineEvents(currentFilters);
    setTimelineEvents(events);
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    // Handle error display
  }
}, 300), [getTimelineEvents]); // 300ms debounce

useEffect(() => {
  const filters: TimelineEventFilters = {
    keyword: keyword,
    categories: selectedCategories,
    // dateRange: ..., sortOrder: ...
  };
  fetchFilteredEvents(filters);
}, [keyword, selectedCategories, /* other filter dependencies */, fetchFilteredEvents]);

// Rendering logic would now just map over `timelineEvents`
// All client-side .filter() calls for these aspects would be removed.
```

This change makes `HealthDataContext` behave more like a backend service that can process queries, significantly improving frontend performance for large datasets.
---
