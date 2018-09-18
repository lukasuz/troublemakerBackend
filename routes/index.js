const express = require('express')
const axios = require('axios')
const router = express.Router()
const YouTube = require('simple-youtube-api')

const YOUTUBE_KEY = process.env.YOUTUBE_KEY
const PLAYLIST_BUZZWORDS = ['japanese advertisement', 'advertisement',
  'werbung', 'werbespot']
const PLAYLIST_MUSIC_BUZZWORDS = ['sad music', 'sad songs']
// Lasse Quality approved Playlists
const VIDEO_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLVTCGFTqGwR5db0D8YaArWU2y21fFYbSc'
const MUSIC_PLAYLIST_URL = 'https://www.youtube.com/watch?v=UAWcs5H-qgQ&list=PLzzwfO_D01M4nNqJKR828zz6r2wGikC5a'

const youtube = new YouTube(YOUTUBE_KEY)

/* GET liefert ein Random Advertisementvideo und ein Musicvideo */
router.get('/emotionalRollercoaster', async function(req, res, next) {
  let experimental = req.query.experimental
  experimental == "false" ? experimental = false : experimental = true
  let payload

  try {
    if(!experimental) {
      payload = await getEmotionalRollercoaster()
      payload.experimental = false
    } else {
      payload = await getExperimentalEmotionalRollercoaster()
      payload.experimental = true
    }
    res.json(payload)
  } catch(err) {
    next(err)
  }
})

/**
* Liefert einen random emotionalRollercoaster
* @returns {Promise<Object>} Promise mit dem emotionalRollercoaster
*/
function getExperimentalEmotionalRollercoaster() {
  let rndPlaylistName = getRandomElementFromArray(PLAYLIST_BUZZWORDS)
  let rndPlaylistMusicName = getRandomElementFromArray(PLAYLIST_MUSIC_BUZZWORDS)

  let videoPromise = youtube.searchPlaylists(rndPlaylistName, 50)
  let musicPromise = youtube.searchPlaylists(rndPlaylistMusicName, 10)

  return Promise.all([videoPromise, musicPromise]).then(values => {
      const videoPlaylists = filterVideos(values[0], ["song", "music", "musik"])
      const musicPlaylists = filterVideos(values[1])

      const rndPlaylist = getRandomElementFromArray(videoPlaylists)
      const rndPlaylistMusic = getRandomElementFromArray(musicPlaylists)

      const playlistId = rndPlaylist.raw.id.playlistId
      const musicId = rndPlaylistMusic.raw.id.playlistId

      return getEmotionalRollercoaster(createPlaylistUrl(playlistId),
        createPlaylistUrl(musicId))
  }).catch(Promise.reject)
}

/**
* Erstellt eine Youtube Playlisturl
* @param {String} id die id zu der die Playlist erstellt werden soll
* @returns {String} die Playlisturl
*/
function createPlaylistUrl(id) {
  return 'https://www.youtube.com/playlist?list=' + id
}

/**
* Liefert emotionalRollercoaster
* @param {String} videoUrl Url des Videos
* @param {String} musicUrl Url des Musikvideos
* @returns {Promise<Object>} Promise mit dem emotionalRollercoaster
*/
function getEmotionalRollercoaster(videoUrl, musicUrl) {
  videoUrl = videoUrl || VIDEO_PLAYLIST_URL
  musicUrl = musicUrl || MUSIC_PLAYLIST_URL
  const videoPromise = getRandomVideoFromPlaylist(videoUrl)
  const musicPromise = getRandomVideoFromPlaylist(musicUrl)
  return Promise.all([videoPromise, musicPromise])
    .then(values => {
      return Promise.resolve({
        video: values[0].raw.snippet.resourceId.videoId,
        music: values[1].raw.snippet.resourceId.videoId
      })
    }).catch(Promise.reject)
}

/**
* Liefert ein Random Video aus einer Playlist
* @param {String} playlistUrl Playlist aus dem das Video genommen wird
* @returns {Promise<video>} Promise mit video
*/
async function getRandomVideoFromPlaylist(playlistUrl) {
  try {
    let playlist = await youtube.getPlaylist(playlistUrl)
    let videos = await playlist.getVideos()
    videos = filterVideos(videos)
    const rndElement = getRandomElementFromArray(videos)
    return Promise.resolve(rndElement)
  } catch (err) {
    return Promise.reject(err)
  }
}

/**
* Filtert gelöschte und private Videos
* @param {Array<video>} videos Array von videos
* @param {Array<String>} forbiddenStrings strings die nicht im title sein dürfen
* @returns {Array<video>} ohne  gelöscht und private Videos
*/
function filterVideos(videos, forbiddenStrings) {
  const validVideos = []
  forbiddenStrings = forbiddenStrings || []
  forbiddenStrings.push("private video", "deleted video")
  videos.forEach(video => {
    let valid = true
    forbiddenStrings.forEach(string => {
      video.title = video.title.toLowerCase()
      if (video.title.includes(string)) valid = false
    })
    if (valid) validVideos.push(video)
  })
  return validVideos
}

/**
* Liefert ein random Element aus einem Array
* @param {Array} array aus dem ein Element ausgewählt werden soll
* @returns {Object} random Element aus dem Array
*/
function getRandomElementFromArray(array) {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

module.exports = router
