################################################################################
#                                                                              #
# Geometric and 3D Computer Vision                                             #
# Harry's corner detector demo                                                 #
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
"""

Keyboard commands:
      i: cycle the underlying image (camera frame, gradient, harris response)
      s: save current frame
      m: change camera property
    a/z: increase/decrease the value of the current property
      q: quit

"""
# Parameters:  ######################################################

# Gaussian window size
SCALE = 7

# Harry's k parameter
K = 0.05

# Response threshold
THRESH = 0.01

# Non-maxima suppression window size
NMS_WINSIZE = 13

#####################################################################


import cv2 as cv
import numpy as np
from CamViewer import CameraViewer


def mainloop():
    print("Opening capture device")
    cam = CameraViewer( )
    print("Press q to exit, i to change the image to display")

    running = True
    image_to_show = 0
    while running:

        img= cam.get_frame()
        if not cam.is_valid():
            #running = False
            continue


        # Harris corner detection

        img_gray = cv.cvtColor( img, cv.COLOR_RGB2GRAY )
        Iu = cv.Sobel( img_gray, cv.CV_32F, dx=1, dy=0, ksize=3 ) / 255.0
        Iv = cv.Sobel( img_gray, cv.CV_32F, dx=0, dy=1, ksize=3 ) / 255.0

        grad_mag = np.sqrt( Iu**2 + Iv**2 )

        C11 = cv.GaussianBlur( Iu * Iu, (SCALE,SCALE), sigmaX = 0, sigmaY = 0 )
        C12 = cv.GaussianBlur( Iu * Iv, (SCALE,SCALE), sigmaX = 0, sigmaY = 0 )
        C22 = cv.GaussianBlur( Iv * Iv, (SCALE,SCALE), sigmaX = 0, sigmaY = 0  )

        Hresp = (C11*C22 - C12*C12) - K*(C11+C22)**2

        # Non-maxima suppression
        Hrespd = cv.dilate( Hresp, cv.getStructuringElement(cv.MORPH_ELLIPSE, (NMS_WINSIZE,NMS_WINSIZE) ) )
        corners = ( (Hresp>THRESH) * (Hresp == Hrespd) ).astype( np.uint8 )*255
        corners_loc = np.argwhere( corners>0 )
        ##########################



        # Visualization
        #
        shown_img = [img, grad_mag, Hresp][ image_to_show ]

        if shown_img.dtype != np.uint8:
            # Scale min-max to 0-1 if image is floating point
            cv.normalize( shown_img, shown_img, 0, 1, norm_type=cv.NORM_MINMAX )
        
        if shown_img.ndim<3 or shown_img.shape[2]==1:
            # Transform to color image so we can later plot coloured circles
            shown_img = cv.cvtColor(shown_img, cv.COLOR_GRAY2BGR);

        for corner in corners_loc:
            cv.circle( shown_img, ( corner[1], corner[0] ), 7, (0,0,0), 2, cv.LINE_AA )
            cv.circle( shown_img, ( corner[1], corner[0] ), 5, (0,0,255), 2, cv.LINE_AA )

        cv.imshow('camera', shown_img )
        keyp = cv.waitKey(1)
        cam.control(keyp)
        running = keyp != 113  # Press q to exit

        if keyp == 105: # Press i to change the displayed image
            image_to_show = (image_to_show+1)%3


if __name__ == "__main__":
    mainloop()
