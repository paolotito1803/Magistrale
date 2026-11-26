################################################################################
#                                                                              #
# Geometric and 3D Computer Vision                                             #
# Optical-flow corner tracking demo                                            #
# Copyright (C) 2025  Filippo Bergamasco                                       #
#                                                                              #
# This program is free software: you can redistribute it and/or modify         #
# it under the terms of the GNU General Public License as published by         #
# the Free Software Foundation, either version 3 of the License, or            #
# (at your option) any later version.                                          #
#                                                                              #
# This program is distributed in the hope that it will be useful,              #
# but WITHOUT ANY WARRANTY; without even the implied warranty of               #
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                #
# GNU General Public License for more details.                                 #
#                                                                              #
# You should have received a copy of the GNU General Public License            #
# along with this program.  If not, see <https://www.gnu.org/licenses/>        #
#                                                                              #
################################################################################
import cv2 as cv
import numpy as np


############################
# LK optical flow parameters

winsize =(11,11)
maxlevel=1
fb_threshold = 0.8
criteria=(cv.TERM_CRITERIA_EPS | cv.TERM_CRITERIA_COUNT, 50, 0.01)

############################
# good features to track parametrs

corner_min_quality = 0.01
max_corners_per_frame = 100
corners_min_distance = 10
corners_blocksize = 13



def colors(n:int) -> list[ tuple[int,int,int] ]:
    import random
    ret: list[ tuple[int,int,int]] = []
    r = int(random.random() * 256)
    g = int(random.random() * 256)
    b = int(random.random() * 256)
    step = 256 / n
    for i in range(n):
        r += step
        g += step
        b += step
        r = int(r) % 256
        g = int(g) % 256
        b = int(b) % 256
        ret.append((r,g,b))

    return ret


if __name__ == "__main__":

    cap = cv.VideoCapture(0)

    N_tracked = 0
    history_size = 20

    prev_frameg = None
    tracked_features = np.zeros( (0,2), dtype=np.float32 )
    tracked_features_ids = np.zeros( (0,1), dtype=np.int64 )
    max_index = 0
    palette = colors(10)
    tracks = {}
    curr_shot = 0

    while(True):
        # Capture frame-by-frame
        ret, frame = cap.read()

        frameg = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
        mask = np.zeros( frameg.shape, dtype=np.uint8)


        # Update tracked features (if we have some)
        #
        if prev_frameg is not None and tracked_features.shape[0]>0:

            # Compute optical flow forward and backward
            # and keep only consistent vectors
            #
            # Forward
            p1, st, err = cv.calcOpticalFlowPyrLK( prev_frameg, frameg, tracked_features, np.copy(tracked_features), winSize=winsize, maxLevel=maxlevel, criteria=criteria )
            assert( p1.shape[0] == tracked_features.shape[0] )
            # Backward
            p0r, st0, err = cv.calcOpticalFlowPyrLK( frameg, prev_frameg, p1, np.copy(p1), winSize=winsize, maxLevel=maxlevel, criteria=criteria )

            # find the good ones
            fb_good = (np.fabs(p0r-tracked_features) < fb_threshold ).all(axis=1)
            fb_good = np.logical_and( np.logical_and( fb_good, st.flatten() ), st0.flatten() )

            bad_ids = tracked_features_ids[ np.logical_not( fb_good.flatten() ) ]

            tracked_features = p1[ fb_good, : ]
            tracked_features_ids = tracked_features_ids[ fb_good.flatten() ]

            # Remove tracks with no match in the current frame
            for ii in range(0, bad_ids.shape[0] ):
                if tracks.get( bad_ids[ii].item(0) ):
                    del tracks[ bad_ids[ii].item(0) ]

            # Update tracks
            for ii in range(0, tracked_features.shape[0] ):
                tidx = tracked_features_ids[ii].item(0)
                if tracks.get( tidx ) == None:
                    tracks[ tidx ] = []

                # Add current location to the track
                tracks[ tidx ].append( tracked_features[ii,:] )
                fcol = palette[ tidx%len(palette) ]

                history = tracks[ tidx ]
                if len(history)>history_size:
                    # History too long, remove the last elements
                    history=history[len(history)-history_size:]
                    tracks[tidx] = history

                # Render feature history as line segments
                for hh in range(0, len(history)-2, 1 ):
                    pos = (int(history[hh][0]),int(history[hh][1]))
                    posn = (int(history[hh+1][0]),int(history[hh+1][1]))
                    _= cv.line( frame, pos, posn , fcol, 2  )

                # Render current feature position
                pos = (int(tracked_features[ii,0]),int(tracked_features[ii,1]))
                cv.drawMarker(frame, pos, fcol, markerSize=6, thickness=2 )

                # Update a mask image so we will avoid extract new features too close to this one
                cv.circle(mask, pos, 20, (255,255,255), thickness=-1 )



        # Extract new features
        #
        corners =  np.squeeze( cv.goodFeaturesToTrack( frameg, max_corners_per_frame, qualityLevel=corner_min_quality, minDistance=corners_min_distance, blockSize=corners_blocksize, mask=(255-mask) ).astype( np.float32 ))


        # Add new features to the list of tracked features
        new_indices = np.array( range(max_index,max_index+corners.shape[0]))
        tracked_features = np.vstack( (tracked_features, corners) )
        tracked_features_ids = np.vstack( (tracked_features_ids, np.expand_dims(new_indices,axis=-1)) )
        max_index = np.amax(tracked_features_ids)+1


        prev_frameg = frameg


        # Display the resulting frame
        cv.imshow('frame',frame)
        keypressed = cv.waitKey(1)
        if keypressed & 0xFF == ord('q'):
            break

        if keypressed & 0xFF == ord('s'):
            _= cv.imwrite( "shot_%04d.png"%(curr_shot), frameg )
            curr_shot = curr_shot+1


    # When everything done, release the capture
    cap.release()
    cv.destroyAllWindows()

    print("bye")
