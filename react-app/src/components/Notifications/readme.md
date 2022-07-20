Allows ui components to provide a notification to the user.

Notifications are classified as info, warn, and error.

Notifications are displayed as soon as the are received, and may be removed, or the container closed.

Notification counts are displayed in the title bar until the notification is dismissed.

Notifications are displayed in a container per type, closing the container does not remove the notification.

Some notifications will auto-remove themselves after a period of time, because it is annoying to have to dismiss informational alerts.

Notifications do though have a history which will reveal recently dismissed notifiations.

Receives notification messages at ('notification', 'add', <notification>)

Notifications have ids. A notification received with the same id will update the notification and force it to be displayed.

A notification looks like this:

id: string
type: string (info, warn, error)
icon: string (a font awesome icon name -- the part of the class name following the "fa-")
title: string
description: string
dismissable: boolean
autodismiss: integer (time until auto dismiss)

Implementation

Notifications are implemented via a knockout viewmodel.
Subscriptions are via our mini-pub-sub system since it is included in the runtime available to all widgets via the runtime parameter (or in the global env sometimes)
