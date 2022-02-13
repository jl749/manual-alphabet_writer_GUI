export function _calDegree(degree){
    /**
     * 각도 계산
     * degree: 라디안 : float
     * return --> 각도 : float
     */
    const pi = Math.PI;
    let angle =  degree * (180/pi);
    if (angle < 0)
       angle = angle +360;
    return angle;
}

export var calLength = (land1, land2) => {
    /**
     * 두 점 사이의 길이 계산
     * land1: 랜드마크1 : array
     * land2: 랜드마크2 : array
     * return --> 두 랜드마크 사이 길이 : float
     */
    let x1 = land1[1];
    let y1 = land1[2];
    let x2 = land2[1];
    let y2 = land2[2];
    let length = Math.hypot(Math.abs(x2-x1), Math.abs(y2-y1))
    return length
};

export var calAngleForHandLandmark = (land1, land2, land3) => {
    /**
     * 랜드마크2를 기준으로 랜드마크1과 랜드마크3 사이 각도 계산
     * land1: 랜드마크1 : array
     * land2: 랜드마크2 : array
     * land3: 랜드마크3 : array
     * return --> 계산된 각도 : float
     */
    let degree = _calDegree(Math.atan2(land3[2] - land2[2],land3[1]-land2[1]) - Math.atan2(land1[2] - land2[2],land1[1] - land2[1]));
    return degree;
};

export var calAngleForHand = (land1, land2) => {
    /**
     * 두 점 사이의 각도 계산
     * land1: 랜드마크1 : array
     * land2: 랜드마크2 : array
     * return --> 두 랜드마크 사이 각도 : float
     */
    let degree = _calDegree(Math.atan2(land1[2] - land2[2],land1[1] - land2[1]));
    return degree;
};

export var normaliseCor = (input) => {
    /**
     * 0번 좌표를 기준으로 정규화
     * input: 랜드마크 배열 : array
     * return --> 0번 좌표를 기준으로 정규화된 배열 : array
     */
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

Math.degrees = function(radians) {
    /**
     * 라디안에서 각도로 변환
     * radians: 라디안 : float
     * return --> 각도 : float
     */
	return radians * 180 / Math.PI;
}

export function wrist_angle_calculator(hand_lmlist) {
    /**
     * 손좌표 0번을 기준으로 17번, 5번 사이 각도 계산
     * hand_lmlist: 손 랜드마크 : array
     * return --> 계산된 각도 : int
     */
    let radian = Math.atan2(hand_lmlist[17][2]-hand_lmlist[0][2],hand_lmlist[17][1]-hand_lmlist[0][1])-Math.atan2(hand_lmlist[5][2]-hand_lmlist[0][2],hand_lmlist[5][1]-hand_lmlist[0][1])
    let wrist_angle = 360 - parseInt(Math.degrees(radian))
    if (wrist_angle < 0){
        wrist_angle += 360;
    }
    return wrist_angle
}

export function similar_text_res_calculator(hand_lmlist){
    /**
     * 비슷한 지문자인 'ㄹ'과 'ㅌ'을 구분하기 위한 손가락 사이 각도 계산
     * hand_lmlist: 손 랜드마크 : array
     * return --> 계산된 각도 : int
     */
    let radian_1 = Math.atan2(hand_lmlist[9][2]-hand_lmlist[12][2],hand_lmlist[9][1]-hand_lmlist[12][1])
    let wrist_angle_1 = parseInt(Math.degrees(radian_1))
    if (wrist_angle_1 < 0){
        wrist_angle_1 += 360;
    }
    let radian_2 = Math.atan2(hand_lmlist[13][2]-hand_lmlist[16][2],hand_lmlist[13][1]-hand_lmlist[16][1])
    let wrist_angle_2 = parseInt(Math.degrees(radian_2))
    if (wrist_angle_2 < 0){
        wrist_angle_2 += 360;
    }
    let similar_text_res = wrist_angle_2 - wrist_angle_1
    return similar_text_res
}

export function min_max_scale(array) {
    /**
     * 랜드마크 좌표를 min-max 스케일 적용
     * array: 손 랜드마크 : array
     * return --> min-max 스케일 적용된 랜드마크 배열 : array
     */
    let scaled_array = [];
    if (Math.max.apply(null, array) == Math.min.apply(null, array)){
        scaled_array = array;
    } else {
        for (let i = 0; i < 21; i++){
            let temp = array[i] / (Math.max.apply(null, array)-Math.min.apply(null, array));
            scaled_array.push(temp);
        }
    }
    return scaled_array;
}

export function generate_vertor(joint, select_array){
    /**
     * 벡터 계산을 위해 새로운 랜드마크 배열 생성, select_array를 key로 배열 생성
     * joint: 정규화가 적용되지 않은 손 랜드마크 : array
     * select_array: 벡터 계산을 위해 지정된 손 랜드마크 순서 : array
     * return --> 벡터 계산을 위한 배열 : array
     */
    let vector = Array.from(new Array(20), _ => Array(2).fill(0));
    for (let i=0; i<20; i++){
        vector[i][0] = joint[select_array[i]][0];
        vector[i][1] = joint[select_array[i]][1];
    }
    return vector;
}

export function differ_vector(vector1, vector2){
    /**
     * 손가락 링크 백터 계산(v1-v2)
     * vector1: 링크좌표1 : array
     * vector2: 링크좌표2 : array
     * return --> 링크 벡터 : array
     */
    let diff = Array.from(new Array(20), _ => Array(2).fill(0));
    for (let i=0; i<20; i++){
        diff[i][0] = vector1[i][0]-vector2[i][0];
        diff[i][1] = vector1[i][1]-vector2[i][1];
    }
    return diff
}

export function frobenius_norm_vector(vector){
    /**
     * 벡터의 크기 계산
     * vector: 링크 벡터 : array
     * return --> 링크 벡터 크기(유클리디안 거리) : array
     */
    let fro_norm = Array.from(new Array(20), _ => Array(1).fill(0));
    for (let i=0; i<20; i++){
        fro_norm[i][0] = Math.sqrt(vector[i][0]**2 + vector[i][1]**2);
    }
    return fro_norm;
}

export function vector_normalization(vector, norm){
    /**
     * 벡터 정규화
     * vector: 링크 벡터 : array
     * norm: 링크 벡터 크기 : array
     * return --> 정규화된 링크 벡터 : array
     */
    let vector_norm = Array.from(new Array(20), _ => Array(2).fill(0));
    for (let i=0; i<20; i++){
        vector_norm[i][0] = vector[i][0] / norm[i][0];
        vector_norm[i][1] = vector[i][1] / norm[i][0];
    }
    return vector_norm;
}

export function multiply_matrix(vector, select_array_1, select_array_2){
    /**
     * 선택한 배열 2개를 활용한 행렬 곱 계산 
     
    np.einsum('nt,nt->n',
        v[[0,1,2,4,5,6,8,9,10,12,13,14,16,17,18],:], 
        v[[1,2,3,5,6,7,9,10,11,13,14,15,17,18,19],:])) 

     * vector: 정규화된 링크 벡터 : array
     * select_array_1: 선택 배열1 : array
     * select_array_2: 선택 배열2 : array
     * return --> 아인슈타인 표기법을 적용한 링크 벡터 : array
     */
    let multipled_vector = Array.from(new Array(15), _ => Array(1).fill(0));
    for (let i=0; i<15; i++){
        multipled_vector[i][0] = (vector[select_array_1[i]][0] * vector[select_array_2[i]][0]) + (vector[select_array_1[i]][1] * vector[select_array_2[i]][1]);
    }
    return multipled_vector;
}

export function get_angle(vector){
    /**
     * 벡터 각도 계산
     * vector: 아인슈타인 표기법을 적용한 링크 벡터 : array
     * return --> 각도 벡터 : array
     */
    let angle = [];
    for (let i=0; i<15; i++){
    angle.push(Math.degrees(Math.acos(vector[i])));
    }
    return angle;
}

// check moving function
export function calc_landmark_list(landmarks){
    /**
     * 좌표 움직임 감지를 위한 랜드마크 배열 생성
     * landmarks: 정규화가 적용되지 않은 랜드마크 배열 : array
     * return --> 움직임에 대한 민감도를 조절한 랜드마크 좌표 리스트 : array
     */
    let image_width = 500;
    let landmark_point = [];
    for(let i=0; i<21; i++){
        let landmark_x = Math.min(parseInt(landmarks[i].x * image_width), image_width-1)
        landmark_point.push([landmark_x/1.5, 0])
    }
    return landmark_point
}

export function deepCopy(obj) {
    /**
     * deepcopy
     * obj: 복사할 객체 : object
     * return --> 복사된 객체 : object
     */
    if(typeof obj !== 'object' || obj === null) {
        return obj;
    }
    if(obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if(obj instanceof Array) {
        return obj.reduce((arr, item, i) => {
            arr[i] = deepCopy(item);
            return arr;
        }, []);
    }
    if(obj instanceof Object) {
        return Object.keys(obj).reduce((newObj, key) => {
            newObj[key] = deepCopy(obj[key]);
            return newObj;
        }, {})
    }
}

export function chian_from_iterable(array){
    /**
     * x, y 좌표를 병합하여 하나의 배열로 생성
     * array: x, y가 분리된 배열 : array
     * return --> x, y, x, y 순으로 병합된 배열 : array
     */
    let linear_array = [];
    for (const value of array) {
        linear_array.push(value[0]);
        linear_array.push(value[1]);
    }
    return linear_array
}

export function pre_process_point_history(point_history) {
    /**
     * 손목 움직임 감지를 위한 배열 전처리
     * point_history: 좌표 움직임 배열 : array
     * return --> 전처리된 움직임 배열 : array
     */
    let image_width = 500;
    let image_height = 500;
    let temp_point_history = deepCopy(point_history);
    let base_x = 0;
    let base_y = 0;
    let index = 0;
    for (const point of temp_point_history) {
        if (index == 0){
            base_x = point[0];
            base_y = point[1];
        }
        temp_point_history[index][0] = (temp_point_history[index][0] - base_x) / image_width;
        temp_point_history[index][1] = (temp_point_history[index][1] - base_y) / image_height;
        index++;
    }
    temp_point_history = chian_from_iterable(temp_point_history);
    return temp_point_history
}

export let cnt10 = 0;
export let dcnt = 0;
export let text_cnt = 0;
export let flag = false; 
export let mode = true;
export let point_history = [];