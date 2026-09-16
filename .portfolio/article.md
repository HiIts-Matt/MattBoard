## What it is

MattBoard is a smart display for a wall. A cheap computer (a Raspberry Pi is the target) sits behind a screen, boots into a browser, and shows a clock, a to-do list, the weather, news headlines and a slow slideshow of your own photos. The commercial versions of this idea want an account, a monthly fee, and space on your kitchen wall for their branding. This one wants none of those: it runs entirely on hardware you already own, stores everything in plain files on that machine, and is licensed under the AGPL, which means anyone who takes it and runs it as a service has to publish their changes too.

## How it works

There are two halves. The browser half draws the board and holds the editor. The server half, a small Express app on the same machine, keeps the layout file, the to-do list, and the keys and tokens for anything that talks to the outside world, so no credential is ever shipped to the screen.

A layout is a list of pages, and each page is a list of widgets pinned to a corner with proportional coordinates rather than pixels, which is how a board arranged on a laptop still lands in the right places on the screen it will actually live on. You enter builder mode from the pill at the bottom, a dot grid appears, every widget grows a labelled handle you can drag, and clicking one opens its own settings beside it. Layouts are saved by name, so there can be a weekday board and a weekend board, and an edit you dislike is thrown away rather than saved.

## The interesting part

The frosted glass behind each widget is not live blur. Blurring a large photo on every frame is exactly the kind of work a Raspberry Pi cannot spare, so the server blurs the photo once with an image library and hands back a static blurred copy. Each widget then paints that copy as its own background, offset by its position on screen, so the blur lines up with the photo behind it and looks like glass while costing almost nothing to redraw. The other setting hands the job back to the browser's own live blur, for machines that can spare it.

![Builder mode with the snap grid and widget handles](media/02-builder.webp)

## Where it is up to

The clock, the to-do list, the photo backdrop, the news reader and the weather all work, and the builder and theme systems are the most finished parts. The calendar is not there yet: the Google account connects and the month grid draws, but fetching events currently fails, so a real calendar on the wall is still the main missing piece. The news widget scores each headline for tone as it arrives, which is how it can be asked for the less bleak half of the feed, and the widget set is still small.
