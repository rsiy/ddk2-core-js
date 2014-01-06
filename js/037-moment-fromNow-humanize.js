// moment.humanize
moment.fn.humanize = _.partial(moment.fn.fromNow, true);

// moment.duration.fromNow
moment.duration.fn.fromNow = _.partial(moment.duration.fn.humanize, true);
