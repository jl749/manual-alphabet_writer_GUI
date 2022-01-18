export function _calDegree(degree){
    const pi = Math.PI;
    let angle =  degree * (180/pi);
    if (angle < 0)
       angle = angle +360;
    return angle;
}

export var calLength = (land1, land2) => {
    let x1 = land1[1];
    let y1 = land1[2];
    let x2 = land2[1];
    let y2 = land2[2];
    let length = Math.hypot(Math.abs(x2-x1), Math.abs(y2-y1))
    return length
};

export var calAngleForHandLandmark = (land1, land2, land3) => {
    let degree = _calDegree(Math.atan2(land3[2] - land2[2],land3[1]-land2[1]) - Math.atan2(land1[2] - land2[2],land1[1] - land2[1]));
    return degree;
};

export var normaliseCor = (input) => {
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

export function wrist_angle_calculator(hand_lmlist) {
    let radian = Math.atan2(hand_lmlist[17][2]-hand_lmlist[0][2],hand_lmlist[17][1]-hand_lmlist[0][1])-Math.atan2(hand_lmlist[5][2]-hand_lmlist[0][2],hand_lmlist[5][1]-hand_lmlist[0][1])
    let wrist_angle = 360 - parseInt(Math.degrees(radian))
    if (wrist_angle < 0){
        wrist_angle += 360;
    }
    return wrist_angle
}

export function similar_text_res_calculator(hand_lmlist){
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
    let vector = Array.from(new Array(20), _ => Array(2).fill(0));
    for (let i=0; i<20; i++){
        vector[i][0] = joint[select_array[i]][0];
        vector[i][1] = joint[select_array[i]][1];
    }
    return vector;
}

export function differ_vector(vector1, vector2){
    let diff = Array.from(new Array(20), _ => Array(2).fill(0));
    for (let i=0; i<20; i++){
        diff[i][0] = vector1[i][0]-vector2[i][0];
        diff[i][1] = vector1[i][1]-vector2[i][1];
    }
    return diff
}

export function frobenius_norm_vector(vector){
    let fro_norm = Array.from(new Array(20), _ => Array(1).fill(0));
    for (let i=0; i<20; i++){
        fro_norm[i][0] = Math.sqrt(vector[i][0]**2 + vector[i][1]**2);
    }
    return fro_norm;
}

export function vector_normalization(vector, norm){
    let vector_norm = Array.from(new Array(20), _ => Array(2).fill(0));
    for (let i=0; i<20; i++){
        vector_norm[i][0] = vector[i][0] / norm[i][0];
        vector_norm[i][1] = vector[i][1] / norm[i][0];
    }
    return vector_norm;
}

export function multiply_matrix(vector, select_array_1, select_array_2){
    let multipled_vector = Array.from(new Array(15), _ => Array(1).fill(0));
    for (let i=0; i<15; i++){
        multipled_vector[i][0] = (vector[select_array_1[i]][0] * vector[select_array_2[i]][0]) + (vector[select_array_1[i]][1] * vector[select_array_2[i]][1]);
    }
    return multipled_vector;
}

export function get_angle(vector){
    let angle = [];
    for (let i=0; i<15; i++){
    angle.push(Math.degrees(Math.acos(vector[i])));
    }
    return angle;
}

// check moving function
export function calc_landmark_list(landmarks){
    let image_width = 500;
    let landmark_point = [];
    for(let i=0; i<21; i++){
        let landmark_x = Math.min(parseInt(landmarks[i].x * image_width), image_width-1)
        landmark_point.push([landmark_x/1.5, 0])
    }
    return landmark_point
}

export function deepCopy(obj) {
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
    let linear_array = [];
    for (const value of array) {
        linear_array.push(value[0]);
        linear_array.push(value[1]);
    }
    return linear_array
}

export function pre_process_point_history(point_history) {
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