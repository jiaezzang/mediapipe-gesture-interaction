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

/** 포스쳐 효과를 주는 메서드 및 매개변수 타입 */
type TPostureEffect = {
    effect: '' | 'drawMetalCat' | 'printPaw' | 'tossCoin' | 'removeCoin';
    props?: printPawProps | drawMetalCatProps | tossCoinProps | removeCoinProps;
};

/** prinPaw() 애니메이션 메서드의 매개변수 */
type TPrintPawProps = {
    x: number;
    y: number;
    ratio: number;
    userType: TUser;
    imgSrc: string;
};
/** drawMetalCat() 애니메이션 메서드의 매개변수 */
type TDrawMetalCatProps = { userType: TUser };
/** tossCoin() 애니메이션 메서드의 매개변수 */
type TTossCoinProps = {
    x: number;
    y: number;
    ratio: number;
    imgPositionY: number;
};
/** removeCoin() 애니메이션 메서드의 매개변수 */
type TRemoveCoinProps = { x: number; y: number };
/** metalCat() 애니메이션 메서드의 매개변수 */
type TMetalCatProps = { userType: TUser };
