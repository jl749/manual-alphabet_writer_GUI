const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

function _calDegree(degree){
    const pi = Math.PI;
    let angle =  degree * (180/pi);
    if (angle < 0)
       angle = angle +360;
    return angle;
}

var calLength = (land1, land2) => {
    let x1 = land1[1];
    let y1 = land1[2];
    let x2 = land2[1];
    let y2 = land2[2];
    let length = Math.hypot(Math.abs(x2-x1), Math.abs(y2-y1))
    return length
};

var calAngleForHandLandmark = (land1, land2, land3) => {
    let degree = _calDegree(Math.atan2(land3[2] - land2[2],land3[1]-land2[1]) - Math.atan2(land1[2] - land2[2],land1[1] - land2[1]));
    return degree;
};

var calAngle = (land1, land2, land3) => {
    let degree = _calDegree(Math.atan2(land3['y'] - land2['y'],land3['x']-land2['x']) - Math.atan2(land1['y'] - land2['y'],land1['x'] - land2['x']));
    return degree;
};

var normaliseCor = (input) => {
    let shift_byX = (input[0]['x'] > 0)? -input[0]['x'] : input[0]['x'];
    let shift_byY = (input[0]['y'] > 0)? -input[0]['y'] : input[0]['y'];

    for(let i=0 ; i<input.length ; i++){
        if(input[i]['visibility'] < 0.7) {
            input[i] = null;
            continue;
        }
        input[i]['x'] += shift_byX;
        input[i]['y'] += shift_byY;
    }

    return input;
};

// Convert from radians to degrees.
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
}

let cnt10 = 0;
let dcnt = 0;
let text_cnt = 0;
let flag = false; 
let mode = false;

function onResults(results) {
    canvasCtx.save(); 
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks[0]) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                            {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', radius: 2});
        }

        // console.log(results.multiHandLandmarks[0]);
        

        // console.log("prepare")

        let lmList = normaliseCor(results.multiHandLandmarks[0])

        let hand_lmlist = [];
        for (let lm in lmList) {
            // console.log(parseInt(lmList[lm]['x']*500), parseInt(lmList[lm]['y']*500));
            hand_lmlist.push([lm, parseInt(lmList[lm]['x']*500), parseInt(lmList[lm]['y']*500)]);
        }
        
        

        // console.log(hand_lmlist);
        if (hand_lmlist.length !== 0) {
            let fingers = [];
            let fingers_1 = [];
            let tipIds = [4, 8, 12, 16, 20];
            let min_detec = 10; 
            let max_detec = 30;            
            let num_lst = [11, 15, 16];
            
            // Korean
            if (mode == true){
                // pass

            } else { // Number 
                let action;
                if (hand_lmlist[tipIds[0]][1] > hand_lmlist[tipIds[4]][1]){
                    if (hand_lmlist[tipIds[0]][1] > hand_lmlist[tipIds[0] - 2][1]) {
                        fingers.push(1);
                    } else {
                        fingers.push(0);
                        }
                    }
                if (hand_lmlist[tipIds[0]][1] < hand_lmlist[tipIds[4]][1]) {
                    if (hand_lmlist[tipIds[0]][1] < hand_lmlist[tipIds[0] - 2][1]) {
                        fingers.push(1);
                    } else {
                        fingers.push(0);
                        }
                    }
                //  Fingers except Thumb
                for (let i=1; i<5; i++){
                    if (hand_lmlist[tipIds[i]][2] < hand_lmlist[tipIds[i]-2][2]){
                        fingers.push(1);
                    } else {
                        fingers.push(0);
                        }
                    }

                
                // Thumb
                if (hand_lmlist[tipIds[0]][2] < hand_lmlist[tipIds[0] - 2][2]){
                    fingers_1.push(1);
                } else {
                    fingers_1.push(0);
                }
                // Fingers except Thumb
                for (let i=1; i<5; i++){
                    if (hand_lmlist[tipIds[i]][1] > hand_lmlist[tipIds[i]-2][1]){
                        fingers_1.push(1);
                        } else {
                        fingers_1.push(0);
                    }
                }
                // console.log(fingers, fingers_1);

                // 엄지 끝과 검지 끝의 거리 측정
                let thumb_index_length = parseInt(calLength(hand_lmlist[4], hand_lmlist[8]));
                // console.log(thumb_index_length);

                // 검지 손가락 각도
                let index_finger_angle_1 = parseInt(calAngleForHandLandmark(hand_lmlist[8], hand_lmlist[9], hand_lmlist[5]));
                let index_finger_angle_2 = parseInt(calAngleForHandLandmark(hand_lmlist[8], hand_lmlist[13], hand_lmlist[5]));
                let index_finger_angle_3 = parseInt(calAngleForHandLandmark(hand_lmlist[8], hand_lmlist[17], hand_lmlist[5]));
                let total_index_angle = index_finger_angle_1 + index_finger_angle_2 + index_finger_angle_3;
                
                // 중지 손가락 각도
                let middle_finger_angle_1 = 360 - parseInt(calAngleForHandLandmark(hand_lmlist[12], hand_lmlist[5], hand_lmlist[9]));
                let middle_finger_angle_2 = parseInt(calAngleForHandLandmark(hand_lmlist[12], hand_lmlist[13], hand_lmlist[9]));
                let middle_finger_angle_3 = parseInt(calAngleForHandLandmark(hand_lmlist[12], hand_lmlist[17], hand_lmlist[9]));
                let total_middle_angle = middle_finger_angle_1 + middle_finger_angle_2 + middle_finger_angle_3;
                
                // console.log(total_middle_angle);
                // 손바닥이 보임, 수향이 위쪽
                if (hand_lmlist[5][1] > hand_lmlist[17][1] && hand_lmlist[4][2] > hand_lmlist[8][2]) {
                    if (JSON.stringify(fingers) === JSON.stringify([0, 1, 0, 0, 0]) && hand_lmlist[8][2] < hand_lmlist[7][2] ) {
                        action = 1;
                    }
                    else if (JSON.stringify(fingers) === JSON.stringify([0, 1, 1, 0, 0])) {
                        action = 2;
                    }
                    else if (JSON.stringify(fingers) === JSON.stringify([[0, 1, 1, 1, 0]]) || JSON.stringify(fingers) === JSON.stringify([1, 1, 1, 1, 0])) {
                        action = 3;
                    }
                    else if (JSON.stringify(fingers) === JSON.stringify([0, 1, 1, 1, 1])) {
                        action = 4;
                    }
                    else if (thumb_index_length < 30) {
                        if (JSON.stringify(fingers) === JSON.stringify([1, 0, 1, 1, 1])){
                            action = 10;
                        } else if (JSON.stringify(fingers) === JSON.stringify([1, 0, 0, 0, 0])){
                            action = 0;
                        }
                    }
                    
                }
                // 손바닥이 보임
                if (hand_lmlist[5][1] > hand_lmlist[17][1]) {
                    if (JSON.stringify(fingers) === JSON.stringify([1, 0, 0, 0, 0])) {
                        if (JSON.stringify(fingers_1) === JSON.stringify([1, 1, 1, 1, 1])) {
                            action = 0;
                        } else {
                            action = 5;
                        }
                    }
                    if (fingers[0] === 0 && JSON.stringify(fingers.slice(-3)) === JSON.stringify([0, 0, 0]) && total_index_angle < 140 && total_middle_angle > 300) {
                        action = 10;
                        cnt10 += 1;
                    }
                    
                    else if (fingers[0] === 0 && JSON.stringify(fingers.slice(-2)) === JSON.stringify([0, 0]) && total_index_angle < 140 && total_middle_angle < 150) {
                        action = 20;
                    }
                }

                // 손등이 보임, 수향이 몸 안쪽으로 향함, 엄지가 들려 있음
                if (hand_lmlist[5][2] < hand_lmlist[17][2] && hand_lmlist[4][2] < hand_lmlist[8][2]) {
                    if (JSON.stringify(fingers_1) === JSON.stringify([1, 1, 0, 0, 0])) {
                        action = 6;
                    }
                    else if (JSON.stringify(fingers_1) === JSON.stringify([1, 1, 1, 0, 0])) {
                        action = 7;
                    }
                    else if (JSON.stringify(fingers_1) === JSON.stringify([1, 1, 1, 1, 0])) {
                        action = 8;
                    }
                    else if (JSON.stringify(fingers_1) === JSON.stringify([1, 1, 1, 1, 1])) {
                        action = 9;
                    }
                }

                // 손등이 보이고, 수향이 몸 안쪽으로 향함
                if (hand_lmlist[5][2] < hand_lmlist[17][2] && hand_lmlist[1][2] < hand_lmlist[13][2]) {
                    // 엄지가 숨겨짐.
                    if (hand_lmlist[4][2] + 30 > hand_lmlist[8][2]) {
                        // console.log(fingers_1.slice(-3));
                        if (JSON.stringify(fingers_1.slice(-3)) === JSON.stringify([1, 0, 0]) && hand_lmlist[8][1] <= hand_lmlist[6][1] + 20) {
                            action = 12;
                        }
                        else if (JSON.stringify(fingers_1.slice(-3)) === JSON.stringify([1, 1, 0]) && hand_lmlist[8][1] <= hand_lmlist[6][1] + 20) {
                            action = 13;
                        }
                        else if (JSON.stringify(fingers_1.slice(-3)) === JSON.stringify([1, 1, 1]) && hand_lmlist[8][1] <= hand_lmlist[6][1] + 20) {
                            action = 14;
                        }
                    } 
                    else {
                        if (JSON.stringify(fingers_1.slice(-3)) === JSON.stringify([1, 0, 0]) && hand_lmlist[8][1] <= hand_lmlist[6][1] + 20) {
                            action = 17;
                        }
                        else if (JSON.stringify(fingers_1.slice(-3)) === JSON.stringify([1, 1, 0]) && hand_lmlist[8][1] <= hand_lmlist[6][1] + 20) {
                            action = 18;
                        }
                        else if (JSON.stringify(fingers_1.slice(-3)) === JSON.stringify([1, 1, 1]) && hand_lmlist[8][1] <= hand_lmlist[6][1] + 20) {
                            action = 19;
                        }

                    }
                }
                // console.log(`핸드좌표 : ${hand_lmlist[5][1]}, ${hand_lmlist[17][1]}`)
                // console.log(`핑거, 검지, 중지 : ${fingers}, ${total_index_angle}, ${total_middle_angle}`);
                if (cnt10 > (max_detec - min_detec)){
                    action = 10;
                    flag = true;
                    dcnt = 0;
                } else if (cnt10 > min_detec){
                    if (hand_lmlist[5][1] > hand_lmlist[17][1] && hand_lmlist[4][2] > hand_lmlist[8][2]){
                        if (JSON.stringify(fingers) === JSON.stringify([0, 1, 0, 0, 0]) && hand_lmlist[8][2] < hand_lmlist[7][2]){
                            dcnt += 1;
                            action = '';
                            if (max_detec > dcnt && dcnt > min_detec){
                                action = 11;
                            } else if (dcnt > max_detec + 10){
                                action = '';
                                cnt10 = 0;
                                dcnt = 0;
                            }
                        }
                    } else if (hand_lmlist[5][1] > hand_lmlist[17][1]){
                        if (JSON.stringify(fingers) === JSON.stringify([1, 0, 0, 0, 0])){
                            dcnt += 1;
                            action = '';
                            if (max_detec > dcnt && dcnt > min_detec){
                                action = 15;
                            } else if (dcnt > max_detec + 10){
                                action = '';
                                cnt10 = 0;
                                dcnt = 0;
                            }
                        }
                    } else if (hand_lmlist[5][2] < hand_lmlist[17][2] && hand_lmlist[4][2] < hand_lmlist[8][2]){
                            dcnt += 1;
                            action = '';
                            if (max_detec > dcnt && dcnt > min_detec){
                                action = 16;
                            } else if (dcnt > max_detec + 10){
                                action = '';
                                cnt10 = 0;
                                dcnt = 0;
                            }
                        }
                    }
                    if (action in num_lst) {
                        flag = true;
                    }
                

                if (action != '') {
                    if (flag == true) {
                        text_cnt += 1;
                        if (text_cnt % max_detec == 0){
                            cnt10 = 0;
                            text_cnt = 0;
                            dcnt = 0;
                            flag = false;
                        }
                    }
                    console.log(action);
                    // landmark list to backend
                    window.api.send("toMain", action);
                }
            }
        }
        // landmark list to backend
        // window.api.send("toMain", normaliseCor(results.multiHandLandmarks[0]));
        
    }
    canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
    // console.log(`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`);
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
    await hands.send({image: videoElement});
    },
    width: 500,
    height: 500
});
camera.start();