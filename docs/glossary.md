# Glossary

| Term            | Definition                                                                                                                                    | Avoid                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| User            | The operator of the application, who spins the wheel and schedules 1:1 meetings with invitees. The only actor of the system.                  | Admin                            |
| Invitee         | A Partner or a Lead Developer: a person the wheel can select for a 1:1 meeting with the user, identified by email address.                    | Candidate, Participant, Contact  |
| Partner         | A business partner at the company. Belongs only to the Partners dataset; a Partner is never a Lead Developer.                                 | Business Partner, Colleague      |
| Lead Developer  | A lead developer at the company. Belongs only to the Lead Developers dataset; a Lead Developer is never a Partner.                            | Lead, Developer, Elite Developer |
| Dataset         | One of the two disjoint sets of invitees: the Partners or the Lead Developers. Each dataset has its own meeting history.                      | Roster, Group, List, Tab         |
| Winner          | The invitee selected by a single spin of the wheel.                                                                                           | Selected Invitee, Pick           |
| Spin            | The action of running the wheel's animation to select a winner.                                                                               |                                  |
| Meeting History | The ordered record, per dataset, of invitees met via the wheel; each entry carries a timestamp. Shown to the user as the "Recently Met" list. | Log, Record, Recently Met list   |
| Excluded Domain | An email domain (currently `finanteq.com`) whose invitees are filtered out of every dataset and can never appear or be selected.              | Blocked domain, Banned domain    |
| Meeting Slot    | One of three proposed weekday time windows (11:00–14:00, Europe/Berlin, 30 minutes) offered after a spin for scheduling the 1:1.              | Time slot, Appointment, Booking  |
| Invite          | The downloadable calendar file (.ics) generated for a chosen meeting slot, addressed to the winner and organized by the user.                 | Calendar entry, Event, Booking   |
| Display Name    | The human-readable name shown in the UI, derived from an invitee's email local part; the email itself is only used in the Invite.             | Full name, Username              |
