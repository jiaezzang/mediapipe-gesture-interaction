/** 포스쳐 타입 */
type TPosture =
    | undefined
    | null
    | '👍'
    | '👎'
    | '✌️'
    | '☝️'
    | '✊'
    | '🖐️'
    | '🤟';

/** 유저 타입 */
type TUser = 'teacher' | 'learner';

/** hand landmark 좌표 */
type landMarkPosition = {
    x: number;
    y: number;
    z: number;
    palmRatio: number;
};

/** 포스쳐 효과를 주는 메서드 및 매개변수 타입 */
type TPostureEffect = {
    effect:
        | ''
        | 'drawMetalCat'
        | 'printPaw'
        | 'tossCoin'
        | 'removeCoin'
        | 'grabObject'
        | 'setOX'
        | 'chooseOX'
        | 'thumbUp'
        | 'thumbDown';
    props?:
        | printPawProps
        | drawMetalCatProps
        | tossCoinProps
        | removeCoinProps
        | TGrabObjectProps;
};

/** prinPaw() 메서드의 매개변수 */
type TPrintPawProps = {
    position: landMarkPosition;
    ratio: number;
    userType: TUser;
    imgSrc: string;
};
/** drawMetalCat() 메서드의 매개변수 */
type TDrawMetalCatProps = { userType: TUser };
/** tossCoin() 메서드의 매개변수 */
type TTossCoinProps = {
    id: string;
    position: landMarkPosition;
    ratio: number;
    imgPositionY: number;
};
/** removeCoin() 메서드의 매개변수 */
type TRemoveCoinProps = { id: string };
/** metalCat() 메서드의 매개변수 */
type TMetalCatProps = { userType: TUser };
/** grabObject() 메서드의 매개변수 */
type TGrabObjectProps = {
    pos0: landMarkPosition;
    pos5: landMarkPosition;
    pos17: landMarkPosition;
};
