# Troublemaker Backend

Created during a hackathon. A small NodeJs server that yields a random youtube advertisement video and a sad music video.

Needs a Youtube API Key passed as an env Variable as *YOUTUBE_KEY*.

## Routes
### /emotionalRollerCoaster

Returns two random youtube video ids, where *video* is a random advertisement video and *music* a random sad song.

**Query:**

- ?experimental
  - false, if only Lasse approved video should be returned

**Returns:**

```json
{
  "video": String,
  "music": String,
  "experimental": Boolean
}
```

