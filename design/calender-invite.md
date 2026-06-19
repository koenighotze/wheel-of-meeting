# Calender invite optimization

The current invite looks like this:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Wheel of Meeting//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:1781534879421@wheel-of-meeting
DTSTAMP:20260615T164700
DTSTART:20260619T130000
DTEND:20260619T133000
SUMMARY:1:1 with <INVITED PERSONs FIRST AND LASTNAME>
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:<EMAIL OF INVITED PERSON>
DESCRIPTION:Scheduled via Wheel of Meeting
END:VEVENT
END:VCALENDAR
```

I want several improvements.

a) the invite should be from david.schmitz@senacor.com
b) the description should be a longer text.
"Hello <INVITED PERSONS FIRSTNAME>,
diese Einladung kommt automatisch aus dem Wheel-of-Meeting.
Keine Sorge. Das hier soll ein sorgenfreies 1:1 sein. Ein kleiner Austausch zu Projekt, Job, Firma, Kultur, Tech und was auch immer grad wichtig ist.

Schieb gerne, falls der Slot nicht passt.
Wir werden MS Teams nutzen.

Liebe Grüße,
David Schmitz"
c) the summary should be "1:1 with David Schmitz"
