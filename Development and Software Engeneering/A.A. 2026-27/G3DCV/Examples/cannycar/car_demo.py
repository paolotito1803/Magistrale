"""A virtual car drives on a hand-drawn circuit, "seeing" the road boundaries
through an obstacle map built with either Otsu thresholding or Canny edges.

Keys: t = Otsu threshold, c = Canny + dilation, space = pause, r = reset, q/ESC = quit.


Geometric and 3D Computer Vision
Filippo Bergamasco & Claude

"""
import cv2
import numpy as np

# ---------------- Tunable constants (all sizes in pixels of the resized image) ----------------
#IMAGE_PATH = "images/img.png" # Use None to acquire from the webcam
IMAGE_PATH = None
CAMERA_INDEX = 0                 # which webcam to use when IMAGE_PATH is None

IMG_W, IMG_H = 1024, 768
CAR_LENGTH = 50
CAR_WIDTH = 25
CAR_SPEED = 250
FPS = 25
BLUR_SIZE = 5
CANNY_LOW = 50
CANNY_HIGH = 150
DILATE_SIZE = 3
WHISKER_ANGLES = [90, 60, 30, -30, -60, -90]  # degrees relative to heading, + = left
WHISKER_MAX = 200                # max ray length
STEER_GAIN = 0.08                # degrees of turn per pixel of left/right imbalance
MAX_TURN = 15                    # max steering per frame, degrees
CHROMA_U_TARGET = -0.35
CHROMA_V_TARGET = -0.35
CHROMA_DISTANCE_THRESHOLD = 0.43


# Camera initialization (if needed)
camera = None
if IMAGE_PATH is None:
    camera = cv2.VideoCapture(CAMERA_INDEX)
    # Skip the first frames: auto-exposure needs a moment, and the start dot
    # is searched in the very first frame we use.
    for _ in range(30):
        camera.read()



def get_frame():
    if camera is None:
        img = cv2.imread(IMAGE_PATH)
    else:
        _, img = camera.read()
    return cv2.resize(img, (IMG_W, IMG_H))   # resize the image so constants can be hard-coded in px 



def find_green_dot(img):
    yuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)
    uv = yuv[:,:,1:3] / 255.0 - 0.5


    chroma_distance = np.sqrt( (uv[:,:,0]-CHROMA_U_TARGET)**2 + (uv[:,:,1]-CHROMA_V_TARGET)**2 )

    mask = chroma_distance < CHROMA_DISTANCE_THRESHOLD 
    mask = (mask*255).astype( np.uint8 )

    mask = cv2.erode(mask, np.ones((3, 3), np.uint8))
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))

    dbg = np.copy(mask)
    dbg = cv2.resize( dbg, None, fx=0.5, fy=0.5 )
    cv2.imshow( "chroma_mask", dbg)

    ys, xs = np.nonzero(mask)
    if len(xs) == 0:
        return None, mask   # no dot: no start position (and nothing to erase)

    mask = cv2.dilate(mask, np.ones((15, 15), np.uint8))
    start = (float(xs.mean()), float(ys.mean()), 90.0)
    return start, mask


def obstacle_otsu(gray):
    # Otsu picks the threshold automatically; INV makes the dark marker white (= obstacle).
    blurred = cv2.GaussianBlur(gray, (BLUR_SIZE, BLUR_SIZE), 0)
    _, obstacles = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    return obstacles


def obstacle_canny(gray):
    # Canny gives thin edges; dilation closes the gaps a diagonal ray could slip through.
    blurred = cv2.GaussianBlur(gray, (BLUR_SIZE, BLUR_SIZE), 0)
    edges = cv2.Canny(blurred, CANNY_LOW, CANNY_HIGH)
    return cv2.dilate(edges, np.ones((DILATE_SIZE, DILATE_SIZE), np.uint8))


def cast_whisker(I, x, y, angle_deg):
    # Sample points along the ray, 1 px apart, and return the distance of the first obstacle.
    a = np.radians(angle_deg)
    d = np.arange(1, WHISKER_MAX)
    xs = np.clip((x + d * np.cos(a)).astype(int), 0, IMG_W - 1)
    ys = np.clip((y - d * np.sin(a)).astype(int), 0, IMG_H - 1)
    hits = np.nonzero(I[ys, xs])[0]

    if len(hits) == 0:
        return WHISKER_MAX
    return d[hits[0]]


def step(car, I):
    x, y, theta = car

    # Cast whiskers and sum left/right distances
    left_dists = 0
    right_dists = 0
    dists = []

    for ang in WHISKER_ANGLES:
        dist = cast_whisker(I,x,y,theta+ang)
        dists.append( dist )

        if ang>0:
            left_dists += dist
        else:
            right_dists +=dist 

    # Proportional steering: turn toward the side with more free space.
    turn_angle = np.clip(STEER_GAIN * (left_dists - right_dists), -MAX_TURN, MAX_TURN)
    theta += turn_angle

    # move the car
    # y-axis points down, the heading direction is (cos theta, -sin theta).
    x += CAR_SPEED / FPS * np.cos(np.radians(theta))
    y -= CAR_SPEED / FPS * np.sin(np.radians(theta))
    return (x, y, theta), dists


def draw_whiskers(img, car, dists):
    x, y, theta = car
    for d, a in zip(dists, WHISKER_ANGLES):
        r = np.radians(theta + a)
        hit = (int(x + d * np.cos(r)), int(y - d * np.sin(r)))
        cv2.line(img, (int(x), int(y)), hit, (0, 200, 255), 1)
        cv2.circle(img, hit, 4, (0, 0, 255), -1)


def draw_car(img, car):
    car_x, car_y, theta = car
    costheta, sintheta = np.cos(np.radians(theta)), np.sin(np.radians(theta))

    corners = [(CAR_LENGTH / 2, CAR_WIDTH / 2), (CAR_LENGTH / 2, -CAR_WIDTH / 2),
               (-CAR_LENGTH / 2, -CAR_WIDTH / 2), (-CAR_LENGTH / 2, CAR_WIDTH / 2)]

    pts = [(car_x + x * costheta - y * sintheta, car_y - x * sintheta - y * costheta) for x, y in corners]

    cv2.fillPoly(img, [np.array(pts, np.int32)], (200,20,20))
    front = (int(car_x + 0.4 * CAR_LENGTH * costheta), int(car_y - 0.4 * CAR_LENGTH * sintheta))
    cv2.circle(img, front, 5, (0, 255, 255), -1)



def build_maps(frame, dot_mask):
    # Work on a copy so the frame shown to the user stays untouched; erase the start dot.
    work = frame.copy()
    #work[dot_mask > 0] = 255
    gray = cv2.cvtColor(work, cv2.COLOR_BGR2GRAY)

    otsu_image = obstacle_otsu( gray ) * (dot_mask==0).astype(np.uint8)
    canny_image = obstacle_canny( gray ) * (dot_mask==0).astype(np.uint8)

    return {"otsu": otsu_image, "canny": canny_image }


def main():
    start_position, dot_mask = find_green_dot(get_frame())

    mode = "canny"
    paused = False

    car = None
    dists = [0] * len(WHISKER_ANGLES)
    names = {"otsu": "Otsu threshold", "canny": "Canny + dilation"}

    while True:
        frame = get_frame()
        start_position, dot_mask = find_green_dot(get_frame())
        maps = build_maps(frame, dot_mask)


        if car is not None and not paused:
            car, dists = step(car, maps[mode])
            if not (0 <= car[0] < IMG_W and 0 <= car[1] < IMG_H):
                car = start_position   # car went outside the image, restart

        I = frame.copy()

        if car is not None:
            draw_whiskers(I, car, dists)
            draw_car(I, car)

        text = f"Mode: {names[mode]} | t: threshold  c: Canny  space: pause  r: reset  q: quit"
        if car is None:
            text = "No green dot found: place it on the track and press r | q: quit"
        cv2.rectangle(I, (0, 0), (IMG_W, 38), (0, 0, 0), -1)
        cv2.putText(I, text, (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        if start_position is not None:
            x, y = start_position[:2]
            cv2.circle(I, (int(x), int(y)), 20, (0,200,0), 3)
        cv2.imshow("Road", I)

        for m in maps:
            view = cv2.cvtColor(maps[m], cv2.COLOR_GRAY2BGR)
            if m == mode and car is not None:
                draw_whiskers(view, car, dists)
            cv2.imshow(names[m], cv2.resize( view, None, fx=0.5, fy=0.5) )

        key = cv2.waitKey(1000 // FPS) & 0xFF
        if key == ord("t"):
            mode = "otsu"
        elif key == ord("c"):
            mode = "canny"
        elif key == ord(" "):
            paused = not paused
        elif key == ord("r"):
            car = start_position
        elif key in (ord("q"), 27): # q or ESC
            break

    if camera is not None:
        camera.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
