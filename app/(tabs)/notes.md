Callinster is a React Native (Expo) app that displays a filtered, deduplicated, and dynamic list of contacts from the device. Users can avoid contacts by number or name prefix, and manage these filters via a modal. The app uses Clerk for authentication and persists user filter preferences with AsyncStorage.

Folder Structure

app/
  _layout.tsx           # Root layout, sets up Clerk and safe area
  index.tsx             # Redirects to login
  (auth)/
    login.tsx           # Google SSO login page
  (tabs)/
    _layout.tsx         # Tab navigation (Home, Notifications, Profile)
    index.tsx           # Main contacts logic and UI
    notifications.tsx   # Notifications tab
    profile.tsx         # Profile tab
    notes.md            # Developer notes
  components/
    Contact.tsx         # Contact card component
    initialLayout.tsx   # Handles session-based navigation
    Select.tsx          # (empty)
    SignOutButton.tsx   # Standalone sign out button
constants/
  theme.ts              # Color palette
styles/
  *.styles.js           # StyleSheets for various screens



  Authentication Flow
Uses Clerk for authentication.
On app start, initialLayout.tsx checks session:
If not signed in, redirects to /login.
If signed in, redirects to /tabs.
Login is via Google SSO in (auth)/login.tsx.
Main Contacts Logic
Fetching and Filtering Contacts
In (tabs)/index.tsx, contacts are fetched using expo-contacts.
Contacts are filtered to:
Exclude those whose numbers start with any prefix in avoidPrefixes.
Exclude those whose names start with any prefix in avoidNamePrefixes.
Duplicate phone numbers are removed per contact.
Contacts are shuffled and the first five are displayed.
Dynamic Replacement
When a contact is deleted, a random new contact (not already displayed) replaces it, keeping the list at five if possible.
Modal for Prefix Management
Users can open a modal to add/remove:
Number prefixes to avoid (e.g., "080", "+234")
Name prefixes to avoid (e.g., "KC", "Cashflow")
Prefixes are persisted using AsyncStorage.
UI Components
Contact Card (Contact.tsx)
Displays contact name and all unique phone numbers.
Each number has "Call" and "WhatsApp" buttons.
The card has a single delete button to remove the contact from the list.
Tabs (_layout.tsx)
Home (contacts), Notifications, and Profile tabs.
Custom icons and color theming.
Styles
Centralized in styles and theme.ts.
Consistent color palette and layout across screens.
Key Functions
useEffect (Contact Fetching and Filtering)
Requests permissions, fetches contacts, filters, deduplicates, shuffles, and sets state.
handleDelete
Removes a contact from the displayed five.
Replaces it with a random contact from the pool if available.
Removes the contact from the pool of all contacts.
Modal Logic
Manages adding/removing avoided prefixes.
Saves prefixes to AsyncStorage for persistence.


Example: Filtering Logic


const validContacts = data.filter(
  contact =>
    contact.phoneNumbers &&
    contact.phoneNumbers.length &&
    !contact.phoneNumbers.some(phone =>
      avoidPrefixes.some(prefix =>
        phone.number?.replace(/\s+/g, "").startsWith(prefix)
      )
    ) &&
    contact.name &&
    !avoidNamePrefixes.some(prefix =>
      contact.name.trim().toLowerCase().startsWith(prefix.toLowerCase())
    )
);


Developer Notes
See (tabs)/notes.md for a summary of the main logic blocks and their purposes.

How to Run
Install dependencies:
npm install
Start the app:
npx expo start
Use Google SSO to log in.
Extending
To add more filters, update the modal and filtering logic in index.tsx.
To change the number of displayed contacts, adjust the .slice(0, 5) logic.
To add more tabs, edit _layout.tsx.








# Callinster Developer Notes

Callinster is a React Native (Expo) app that displays a filtered, deduplicated, and dynamic list of contacts from the device. Users can avoid contacts by number or name prefix, and manage these filters via a modal. The app uses Clerk for authentication and persists user filter preferences with AsyncStorage.

---

## Folder Structure

```
app/
  _layout.tsx           # Root layout, sets up Clerk and safe area
  index.tsx             # Redirects to login
  (auth)/
    login.tsx           # Google SSO login page
  (tabs)/
    _layout.tsx         # Tab navigation (Home, Notifications, Profile)
    index.tsx           # Main contacts logic and UI
    notifications.tsx   # Notifications tab
    profile.tsx         # Profile tab
    notes.md            # Developer notes
  components/
    Contact.tsx         # Contact card component
    initialLayout.tsx   # Handles session-based navigation
    Select.tsx          # (empty)
    SignOutButton.tsx   # Standalone sign out button
constants/
  theme.ts              # Color palette
styles/
  *.styles.js           # StyleSheets for various screens
```

---

## Authentication Flow

- Uses Clerk for authentication.
- On app start, `initialLayout.tsx` checks session:
  - If not signed in, redirects to `/login`.
  - If signed in, redirects to `/tabs`.
- Login is via Google SSO in `(auth)/login.tsx`.

---

## Main Contacts Logic

### Fetching and Filtering Contacts

- In `(tabs)/index.tsx`, contacts are fetched using `expo-contacts`.
- Contacts are filtered to:
  - Exclude those whose numbers start with any prefix in `avoidPrefixes`.
  - Exclude those whose names start with any prefix in `avoidNamePrefixes`.
- Duplicate phone numbers are removed per contact.
- Contacts are shuffled and the first five are displayed.

### Dynamic Replacement

- When a contact is deleted, a random new contact (not already displayed) replaces it, keeping the list at five if possible.

### Modal for Prefix Management

- Users can open a modal to add/remove:
  - Number prefixes to avoid (e.g., "080", "+234")
  - Name prefixes to avoid (e.g., "KC", "Cashflow")
- Prefixes are persisted using AsyncStorage.

---

## UI Components

### Contact Card (`Contact.tsx`)

- Displays contact name and all unique phone numbers.
- Each number has "Call" and "WhatsApp" buttons.
- The card has a single delete button to remove the contact from the list.

### Tabs (`_layout.tsx`)

- Home (contacts), Notifications, and Profile tabs.
- Custom icons and color theming.

---

## Styles

- Centralized in `styles/` and `constants/theme.ts`.
- Consistent color palette and layout across screens.

---

## Key Functions

### useEffect (Contact Fetching and Filtering)

- Requests permissions, fetches contacts, filters, deduplicates, shuffles, and sets state.

### handleDelete

- Removes a contact from the displayed five.
- Replaces it with a random contact from the pool if available.
- Removes the contact from the pool of all contacts.

### Modal Logic

- Manages adding/removing avoided prefixes.
- Saves prefixes to AsyncStorage for persistence.

---

## Example: Filtering Logic

```ts
const validContacts = data.filter(
  contact =>
    contact.phoneNumbers &&
    contact.phoneNumbers.length &&
    !contact.phoneNumbers.some(phone =>
      avoidPrefixes.some(prefix =>
        phone.number?.replace(/\s+/g, "").startsWith(prefix)
      )
    ) &&
    contact.name &&
    !avoidNamePrefixes.some(prefix =>
      contact.name.trim().toLowerCase().startsWith(prefix.toLowerCase())
    )
);
```

---

## How to Run

1. Install dependencies:
   ```
   npm install
   ```
2. Start the app:
   ```
   npx expo start
   ```
3. Use Google SSO to log in.

---

## Extending

- To add more filters, update the modal and filtering logic in `index.tsx`.
- To change the number of displayed contacts, adjust the `.slice(0, 5)` logic.
- To add more tabs, edit `_layout.tsx`.

---


Styles  
Centralized in `styles/` and `constants/theme.ts`.  
Consistent color palette and layout across screens.

---

## Key Functions

### useEffect (Contact Fetching and Filtering)
- Requests permissions, fetches contacts, filters, deduplicates, shuffles, and sets state.

### handleDelete
- Removes a contact from the displayed five.
- Replaces it with a random contact from the pool if available.
- Removes the contact from the pool of all contacts.

### Modal Logic
- Manages adding/removing avoided prefixes.
- Saves prefixes to AsyncStorage for persistence.

---

## Example: Filtering Logic

```ts
const validContacts = data.filter(
  contact =>
    contact.phoneNumbers &&
    contact.phoneNumbers.length &&
    !contact.phoneNumbers.some(phone =>
      avoidPrefixes.some(prefix =>
        phone.number?.replace(/\s+/g, "").startsWith(prefix)
      )
    ) &&
    contact.name &&
    !avoidNamePrefixes.some(prefix =>
      contact.name.trim().toLowerCase().startsWith(prefix.toLowerCase())
    )
);
```

---

## Developer Notes

See `(tabs)/notes.md` for a summary of the main logic blocks and their purposes.

---

## How to Run

1. **Install dependencies:**
   ```
   npm install
   ```
2. **Start the app:**
   ```
   npx expo start
   ```
3. **Use Google SSO to log in.**

---

## Extending

- To add more filters, update the modal and filtering logic in `index.tsx`.
- To change the number of displayed contacts, adjust the `.slice(0, 5)` logic.
- To add more tabs, edit `_layout.tsx`.

---