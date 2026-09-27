# RyM App — Features v1.0

## Authentication

### AUTH-01 Registration
A new user can create an account.

### AUTH-02 Login
A registered user can authenticate.

### AUTH-03 Logout
An authenticated user can log out.

### AUTH-04 Password recovery
The authentication system supports password recovery/reset.

## Profile

### PROF-01 Account data
Display account email and basic identity information.

### PROF-02 Body data
Store and edit:
- weight in kg
- height in cm

### PROF-03 Profile states
Support loading, editing, saving, success, validation error, and save error states.

## Exercises

### EX-01 Official exercise
An official exercise has a name and muscle group.

### EX-02 Browse
Users can browse exercises by muscle group.

### EX-03 Proposal
A user can request an exercise that does not exist.

### EX-04 Review
An admin can accept or reject a proposal.

### EX-05 Publication
An accepted proposal becomes an official exercise.

### EX-06 Administration
An admin can create/edit/remove official exercises according to the final authorization rules.

## Routines

### RT-01 Create
A user can create a reusable routine template.

### RT-02 Edit
A user can edit their routine.

### RT-03 Exercises
A routine contains exercises.

### RT-04 Sets
Each routine exercise can have any number of planned sets.

### RT-05 Independent set configuration
Every set independently stores planned weight and planned repetitions.

### RT-06 Calendar assignment
A routine can be assigned to a calendar date.

## Workouts

### WK-01 Start
A user can start a workout from a routine.

### WK-02 Snapshot
Starting a workout creates an execution based on the planned routine values.

### WK-03 Actual values
Actual weight and repetitions are recorded independently.

### WK-04 Global timer
A workout can use one global timer.

### WK-05 Timer pause/resume
The timer can pause/resume without resetting.

### WK-06 Timer continuity
Changing exercises never resets the timer.

### WK-07 Complete
A completed workout stores its actual execution.

### WK-08 Exit protection
Exiting an active workout protects against accidental data loss.

## Calendar

### CAL-01 View
View routines assigned to dates.

### CAL-02 Assign
Assign a routine to a date.

### CAL-03 Date detail
A selected date exposes its assigned routine(s) according to the final v1 calendar rule.

## Meals

### MEAL-01 Daily slots
Each day has exactly five meal slots.

### MEAL-02 Description
Each slot stores a short description.

### MEAL-03 Meal type
Each record identifies its meal type.

## Administration

### ADM-01 Users
Admins can manage users.

### ADM-02 Exercises
Admins can manage official exercises.

### ADM-03 Requests
Admins can review exercise proposals.

### ADM-04 Full access
Admins retain all normal-user functionality.

## Cross-cutting requirements

- Responsive desktop/mobile UI.
- Mobile workout execution has large touch targets.
- Consistent validation and error states.
- User-owned records must be isolated through authorization rules.
- Admin-only operations must be enforced server-side, not only by hiding UI.
