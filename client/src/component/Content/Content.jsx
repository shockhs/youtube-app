import React, { useState, useRef } from 'react';
import { findDOMNode } from 'react-dom'
import ReactPlayer from 'react-player'
import Duration from '../../helpers/Duration'
import screenfull from 'screenfull'
import io from 'socket.io-client'
import './Content.css'
import { useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'


let socket;
/*const initialState = {
  url: 'https://www.youtube.com/watch?v=0eIY5b0RKE0',
  pip: false,
  playing: true,
  controls: false,
  light: false,
  volume: 0.8,
  muted: false,
  played: 0,
  loaded: 0,
  duration: 0,
  playbackRate: 1.0,
  loop: false
}*/

const Content = ({ match: { params }, location: { state } }) => {
    const playerRef = useRef();
    const [playing, setPlaying] = useState(true)
    const [duration, setDuration] = useState(0);// eslint-disable-next-line
    const [controls, setControls] = useState(false)// eslint-disable-next-line
    const [loaded, setLoaded] = useState(0);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(0.5)
    const isMounted = useRef(true);
    const [inputUrl, setInputUrl] = useState('');
    const [url, setUrl] = useState(state)
    const [playbackRate, setPlaybackRate] = useState(1);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const ENDPOINT = 'https://react-youtube-application.herokuapp.com/';
    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])
    useEffect(() => {
        let room = params.session_id;
        room = room.substr(1);
        socket = io(ENDPOINT);
        socket.emit('createRoom', { name: room, url: url }, (error) => {
            if (error) {
                alert(error);
            }
        });
        return () => {
            socket.emit('disconnect');
            socket.off();
        }
    }, [ENDPOINT, params, url])
    useEffect(() => {
        socket.on('status', ({ status }) => {
            setPlaying(status)
        });
        socket.on('data', ({ loaded, played }) => {
            setLoaded(loaded);
            setPlayed(played)
        });
        socket.on('volumeData', ({ volume }) => {
            setVolume(volume)
        });
        socket.on('seekData', ({ played }) => {
            setPlayed(played)
            playerRef.current.seekTo(parseFloat(played))
        });
        socket.on('statusSeeking', ({ seeking }) => {
            setSeeking(seeking);
        })
        socket.on('muteData', ({ muted }) => {
            setMuted(muted)
        })
        socket.on('playbackData', ({ rate }) => {
            setPlaybackRate(rate)
        })
        socket.on('controlsData', () => {
            setLoaded(0)
            setPlayed(0)
            setPlaying(false)
            playerRef.current.seekTo(0);
        })
        return () => {
            //
        };
    }, []);
    const handleSeekMouseDown = () => {
        socket.emit('seekStatus', true, (error) => {
            if (error) {
                alert(error);
            }
        })
    }
    const handleClickFullscreen = () => {
        if (isMounted.current)
            screenfull.request(findDOMNode(playerRef.current), "*")
    }
    const handleSeekChange = (event) => {
        socket.emit('seekEvent', parseFloat(event.target.value), (error) => {
            if (error) {
                alert(error);
            }
        })
    }
    const handleProgress = (state) => {
        // console.log('onProgress', state)
        // We only want to update time slider if we are not currently seeking
        if (!seeking) {
            socket.emit('event', { loaded: state.loaded, played: state.played }, (error) => {
                if (error) {
                    alert(error);
                }
            })
        }
    }// eslint-disable-next-line
    const handleSetPlaybackRate = (event) => {
        socket.emit('playbackEvent', parseFloat(event.target.value), (error) => {
            if (error) {
                alert(error);
            }
        })
    }
    const handleSeekMouseUp = () => {
        socket.emit('seekStatus', false, (error) => {
            if (error) {
                alert(error);
            }
        })
    }
    const handleOnDuration = (duration) => {
        setDuration(duration);
    }
    const handlePlayPause = () => {
        socket.emit('playEvent', !playing, (error) => {
            if (error) {
                alert(error);
            }
        })
        setPlaying(playing => !playing)
    }
    const handleToggleMuted = () => {
        socket.emit('muteEvent', !muted, (error) => {
            if (error) {
                alert(error);
            }
        })
    }
    const handleVolumeChange = event => {
        socket.emit('volumeEvent', parseFloat(event.target.value), (error) => {
            if (error) {
                alert(error);
            }
        })
    }
    const handleToggleControls = () => {
        socket.emit('controlsEvent', (error) => {
            if (error) {
                alert(error)
            }
        })
    }
    return (
        <section id="content">

            <div className="content-video">
                <ReactPlayer
                    ref={playerRef}
                    width='640px'
                    height='360px'
                    volume={volume}
                    controls={controls}
                    muted={muted}
                    playbackRate={playbackRate}
                    playing={playing}
                    url={url}
                    onReady={() => console.log('onReady')}
                    onStart={() => console.log('onStart')}
                    onError={event => console.log('onError', event)}
                    onBuffer={() => console.log('onBuffer')}
                    onSeek={event => console.log('onSeek', event)}
                    onProgress={handleProgress}
                    onDuration={handleOnDuration}
                />
                {/*<button onClick={handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
            <button onClick={handleSetPlaybackRate} value={1}>1x</button>
            <button onClick={handleSetPlaybackRate} value={1.5}>1.5x</button>
            <button onClick={handleSetPlaybackRate} value={2}>2x</button>
            <button onClick={handleClickFullscreen}>Fullscreen</button>*/}
                <div className="content-video-controls">
                    <div className="content-video-controls-timeline">
                        <Duration seconds={duration * played} />
                        <input
                            type='range' min={0} max={0.999999} step='any'
                            value={played}
                            onMouseDown={handleSeekMouseDown}
                            onChange={handleSeekChange}
                            onMouseUp={handleSeekMouseUp}
                        />
                        <Duration seconds={duration * (1 - played)} />
                        <div className="content-video-controls-fullscreen">
                            <label htmlFor="fullscreen">
                                <input id='fullscreen' type='checkbox' checked={true} onChange={handleClickFullscreen} />
                                <div className="icon-box">
                                    <i class="fa fa-arrows-alt" aria-hidden="true"></i>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="content-video-controls-params">
                        <div className="content-video-controls-params-box">
                            <div className="content-video-controls-params-box-percent">
                                <svg>
                                    <circle cx="70" cy="70" r="70"></circle>
                                    <circle style={{ strokeDashoffset: `${440 - (440 * Math.round((played / 1) * 100)) / 100}` }} cx="70" cy="70" r="70"></circle>
                                </svg>
                                <div className="content-video-controls-params-box-number">
                                    <h2>{Math.round((played / 1) * 100)}<span>%</span></h2>
                                </div>
                            </div>
                            <h2 className="content-video-controls-params-text">playing</h2>
                        </div>
                        <div className="content-video-controls-params-box">
                            <div className="content-video-controls-params-box-percent">
                                <svg>
                                    <circle cx="70" cy="70" r="70"></circle>
                                    <circle cx="70" cy="70" r="70"></circle>
                                </svg>
                                <div className="content-video-controls-params-box-number">
                                    {playing
                                        ? <Link to={'/'} onClick={(event) => { event.preventDefault(); handlePlayPause() }} className="pause-button"></Link>
                                        : <Link to={'/'} onClick={(event) => { event.preventDefault(); handlePlayPause() }} className="play-button"></Link>}

                                </div>
                            </div>
                        </div>
                        <div className="content-video-controls-params-box">
                            <div className="content-video-controls-params-box-percent">
                                <svg >
                                    <circle cx="70" cy="70" r="70"></circle>
                                    <circle style={{ strokeDashoffset: `${440 - (440 * Math.round((volume / 1) * 100)) / 100}` }} cx="70" cy="70" r="70"></circle>
                                </svg>
                                <div className="content-video-controls-params-box-number">
                                    <h2>{Math.round((volume / 1) * 100)}<span>%</span></h2>
                                </div>
                            </div>
                            <h2 className="content-video-controls-params-text">volume</h2>
                        </div>
                        {/*playing
                {playing ? 'true' : 'false'}<br />
            volume
            {volume.toFixed(3)}<br />
            played
            {played.toFixed(3)}<br />
            loaded
                        {loaded.toFixed(3)}<br />*/}
                    </div>
                </div>
                <div className="content-video-controls-options">
                    <label htmlFor="controls">
                        <input id='controls' type='checkbox' checked={!controls} onChange={handleToggleControls} />
                        <div className="icon-box">
                            <i class="fa fa-cog" aria-hidden="true"></i>
                        </div>
                    </label>
                    <label htmlFor="muted">
                        <input id='muted' type='checkbox' checked={!muted} onChange={handleToggleMuted} />
                        <div className="icon-box">
                            <i class="fa fa-volume-off" aria-hidden="true"></i>
                        </div>
                    </label>
                    <input class="range" type='range' min={0} max={1} step='any' value={volume} onChange={handleVolumeChange} />
                </div>
            </div>
            <div className="content-chat">
                <form className="creater-form" autoComplete="off">
                    <div className="input-field">
                        <input required onChange={(event) => { setInputUrl(event.target.value) }} type='text' name="url" />
                        <label>Please Enter New Video URL</label>
                        <span></span>
                    </div>
                    <div className="space-between">
                        <Link to={'/'} onClick={(event) => { event.preventDefault(); setUrl(inputUrl); }}>
                            Load</Link>
                        <Link to='/' >Exit</Link>
                    </div>
                </form>
                <div className="copy-form mt-20" autoComplete="off">
                    <div className="copy-field">
                        <input required value={url} type='text' name="url" />
                        <label>Current URL</label>
                        <span></span>
                    </div>
                    <Link to={'/'} className="copy-field-stylish" onClick={(event) => { event.preventDefault(); setUrl(inputUrl); }}>
                        Copy</Link>
                </div>
            </div>
        </section >
    );
}

export default withRouter(Content);
