/**
 * The $1 Unistroke Recognizer (JavaScript version)
 *
 *  Jacob O. Wobbrock, Ph.D.
 *  The Information School
 *  University of Washington
 *  Seattle, WA 98195-2840
 *  wobbrock@uw.edu
 *
 *  Andrew D. Wilson, Ph.D.
 *  Microsoft Research
 *  One Microsoft Way
 *  Redmond, WA 98052
 *  awilson@microsoft.com
 *
 *  Yang Li, Ph.D.
 *  Department of Computer Science and Engineering
 *  University of Washington
 *  Seattle, WA 98195-2840
 *  yangli@cs.washington.edu
 *
 * The academic publication for the $1 recognizer, and what should be
 * used to cite it, is:
 *
 *     Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). Gestures without
 *     libraries, toolkits or training: A $1 recognizer for user interface
 *     prototypes. Proceedings of the ACM Symposium on User Interface
 *     Software and Technology (UIST '07). Newport, Rhode Island (October
 *     7-10, 2007). New York: ACM Press, pp. 159-168.
 *     https://dl.acm.org/citation.cfm?id=1294238
 *
 * The Protractor enhancement was separately published by Yang Li and programmed
 * here by Jacob O. Wobbrock:
 *
 *     Li, Y. (2010). Protractor: A fast and accurate gesture
 *     recognizer. Proceedings of the ACM Conference on Human
 *     Factors in Computing Systems (CHI '10). Atlanta, Georgia
 *     (April 10-15, 2010). New York: ACM Press, pp. 2169-2172.
 *     https://dl.acm.org/citation.cfm?id=1753654
 *
 * This software is distributed under the "New BSD License" agreement:
 *
 * Copyright (C) 2007-2012, Jacob O. Wobbrock, Andrew D. Wilson and Yang Li.
 * All rights reserved. Last updated July 14, 2018.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the names of the University of Washington nor Microsoft,
 *      nor the names of its contributors may be used to endorse or promote
 *      products derived from this software without specific prior written
 *      permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Jacob O. Wobbrock OR Andrew D. Wilson
 * OR Yang Li BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
 * OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
/** 좌표를 관리할 클래스 */
export class Point {
    constructor(public X: number, public Y: number) {}

    toString() {
        return `new Point(${this.X}, ${this.Y})`;
    }
}

/** 사각(Box) 영역을 관리할 클래스 */
class Rectangle {
    constructor(public X: number, public Y: number, public Width: number, public Height: number) {}
}

/**
 * 결과 클래스 Class
 */
class Result {
    constructor(public Name: string, public Score: number, public Time: number) {}
}

/**
 * 단일 스트로크(선)을 관리할 클래스
 */
class Unistroke {
    public Vector: number[];
    Points: Point[];
    constructor(public Name: string, public points: Point[]) {
        this.Points = this.Resample(points, NumPoints);
        const radians = this.IndicativeAngle(this.Points);
        this.Points = RotateBy(this.Points, -radians);
        this.Points = this.ScaleTo(this.Points, SquareSize);
        this.Points = this.TranslateTo(this.Points, Origin);
        this.Vector = this.Vectorize(this.Points);
    }

    /**
     * 제스처 점들을 샘플링하여 새로운 좌표 배열으르 생성한다.
     * 원래 길이와 새로운 길이를 이용해 각 좌표 사이 거리를 유지하며 원래의 제스처 형태를 유지하며 그리는 것
     * @param {Point[]} points
     * @param {number} n - 제스처 데이터를 샘플링할 길이
     * @returns {Point[]} nPoints
     */
    Resample(points: Point[], n: number): Point[] {
        const I = this.PathLength(points) / (n - 1);
        let D = 0.0;
        const nPoints = [points[0]];

        for (let i = 1; i < points.length; i++) {
            const d = Distance(points[i - 1], points[i]);
            if (D + d >= I) {
                const qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
                const qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
                const q = new Point(qx, qy);
                nPoints.push(q);
                points.splice(i, 0, q);
                D = 0.0;
            } else D += d;
        }

        if (nPoints.length === n - 1) {
            nPoints.push(new Point(points[points.length - 1].X, points[points.length - 1].Y));
        }
        return nPoints;
    }

    /**
     * 주어진 좌표의 비율을 유지하며 크기를 조절한다.
     * (2D제스처를 가정하고 있으며, 직선이 없다고 가정한다.)
     * @param {Point[]} points
     * @param {number} size
     * @returns {Point[]} nPoints
     */
    ScaleTo(points: Point[], size: number): Point[] {
        const B = BoundingBox(points); // 각 점들의 바운딩 박스 조회
        const nPoints = [];
        for (let i = 0; i < points.length; i++) {
            const qx = points[i].X * (size / B.Width);
            const qy = points[i].Y * (size / B.Height);
            nPoints.push(new Point(qx, qy));
        }
        return nPoints;
    }

    /**
     * 좌표를 새로운 중심점으로 이동한다.
     * @param {Point[]} points
     * @param {Point} pt - 새로운 중심 좌표
     * @returns {Point[]} nPoints
     */
    TranslateTo(points: Point[], pt: Point): Point[] {
        const c = Centroid(points);
        const nPoints = [];
        for (let i = 0; i < points.length; i++) {
            const qx = points[i].X + pt.X - c.X;
            const qy = points[i].Y + pt.Y - c.Y;
            nPoints.push(new Point(qx, qy));
        }
        return nPoints;
    }

    /**
     * 좌표를 Protractor 알고리즘에서 사용될 수 있는 벡터 형태로 변경한다.
     * @param {Point[]} points
     * @returns {number[]} vector 정규화된 벡터
     */
    Vectorize(points: Point[]): number[] {
        // for Protractor
        let sum = 0.0;
        const vector = [];
        for (let i = 0; i < points.length; i++) {
            vector.push(points[i].X);
            vector.push(points[i].Y);
            sum += points[i].X * points[i].X + points[i].Y * points[i].Y;
        }
        const magnitude = Math.sqrt(sum);
        for (let i = 0; i < vector.length; i++) vector[i] /= magnitude;
        return vector;
    }

    /**
     * 좌표들의 중심 좌표를 계산하여 첫 번째 점과 중심 좌표의 각도를 라디안 단위로 계산
     * @param {Point[]} points
     * @returns {number} 라디안 각도
     */
    IndicativeAngle(points: Point[]): number {
        const c = Centroid(points);
        return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
    }

    /**
     * 좌표를 통해 길이를 계산한다. (제스처의 경로 길이 측정)
     * @param {Point[]} points
     * @returns {number} 길이
     */
    PathLength(points: Point[]): number {
        let d = 0.0;
        for (let i = 1; i < points.length; i++) d += Distance(points[i - 1], points[i]);
        return d;
    }
}

/**
 * DollarRecognizer 클래스
 */
export class DollarRecognizer {
    private Unistrokes: Unistroke[];

    constructor() {
        this.Unistrokes = [
            new Unistroke(
                'good',
                new Array(
                    new Point(108, 167),
                    new Point(106, 169),
                    new Point(104, 170),
                    new Point(102.83762075481009, 171.1623792451899),
                    new Point(102, 172),
                    new Point(100, 175),
                    new Point(98.84906698697624, 176.53457735069836),
                    new Point(97, 179),
                    new Point(96, 181),
                    new Point(95.37814891126769, 182.24370217746463),
                    new Point(93, 187),
                    new Point(92.37808466325885, 188.2438306734823),
                    new Point(91, 191),
                    new Point(90.12035806526917, 194.51856773892328),
                    new Point(90, 195),
                    new Point(87.22186505869975, 200.5562698826005),
                    new Point(87, 201),
                    new Point(86, 207),
                    new Point(85.96859655711286, 207.12561377154853),
                    new Point(84.34158328009802, 213.63366687960792),
                    new Point(83, 219),
                    new Point(82.80652573232213, 220.1608456060672),
                    new Point(82, 225),
                    new Point(81.64651182716221, 226.76744086418896),
                    new Point(80.33089662358597, 233.34551688207011),
                    new Point(80, 235),
                    new Point(79.44551234672274, 239.99038887949544),
                    new Point(79, 244),
                    new Point(79, 246.67406171204482),
                    new Point(79, 250),
                    new Point(79, 253.38240930745937),
                    new Point(79, 258),
                    new Point(79, 260.0907569028739),
                    new Point(79, 264),
                    new Point(79.30910938138896, 266.7819844325007),
                    new Point(80, 273),
                    new Point(80.14295612344854, 273.42886837034564),
                    new Point(82, 279),
                    new Point(82.31043032500547, 279.7760758125137),
                    new Point(84, 284),
                    new Point(84.85048831769727, 285.98447274129364),
                    new Point(87, 291),
                    new Point(87.64395138103293, 292.07325230172154),
                    new Point(90, 296),
                    new Point(91.36296040292474, 297.6355524835097),
                    new Point(95, 302),
                    new Point(95.52844380149621, 302.88073966916033),
                    new Point(98, 307),
                    new Point(99.5846446356878, 308.0564297571252),
                    new Point(101, 309),
                    new Point(104.9100460676666, 312.12803685413326),
                    new Point(106, 313),
                    new Point(110, 316),
                    new Point(110.2679884114024, 316.16079304684143),
                    new Point(115, 319),
                    new Point(116.02034901769113, 319.6122094106147),
                    new Point(120, 322),
                    new Point(121.98777471458861, 322.5679356327396),
                    new Point(127, 324),
                    new Point(128.33766471267785, 324.66883235633895),
                    new Point(133, 327),
                    new Point(134.46665282732613, 327.2933305654652),
                    new Point(138, 328),
                    new Point(141.10502635906215, 328),
                    new Point(147, 328),
                    new Point(147.8133739544767, 328),
                    new Point(151, 328),
                    new Point(154.49452638190286, 327.56318420226216),
                    new Point(159, 327),
                    new Point(161.13831599002202, 326.643614001663),
                    new Point(165, 326),
                    new Point(167.32424634851222, 324.4505024343252),
                    new Point(168, 324),
                    new Point(172.9999614792859, 320.8750240754463),
                    new Point(176, 319),
                    new Point(178.83583439979063, 317.5820828001047),
                    new Point(180, 317),
                    new Point(184.39967044095982, 313.85737825645725),
                    new Point(187, 312),
                    new Point(188.94854708522593, 309.07717937216114),
                    new Point(189, 309),
                    new Point(194, 305),
                    new Point(194.15023565208932, 304.8497643479107),
                    new Point(198, 301),
                    new Point(198.7583751855953, 299.98883308587295),
                    new Point(201, 297),
                    new Point(202.5292389433195, 294.4512684278008),
                    new Point(204, 292),
                    new Point(205, 290),
                    new Point(205.5102758627011, 288.4691724118967),
                    new Point(207, 284),
                    new Point(207.3917275136712, 282.041362431644),
                    new Point(208, 279),
                    new Point(209, 276),
                    new Point(209, 275.555523342126),
                    new Point(209, 272),
                    new Point(209, 270),
                    new Point(209, 268.84717574671146),
                    new Point(209, 266),
                    new Point(208.0635282723021, 262.25411308920843),
                    new Point(208, 262),
                    new Point(207, 260),
                    new Point(205.43631681042626, 256.0907920260656),
                    new Point(205, 255),
                    new Point(204, 251),
                    new Point(203.55398508441303, 249.66195525323909),
                    new Point(203, 248),
                    new Point(201, 245),
                    new Point(200.25063239419836, 243.87594859129754),
                    new Point(199, 242),
                    new Point(197, 240),
                    new Point(195.85073167031308, 238.85073167031308),
                    new Point(195, 238),
                    new Point(192, 236),
                    new Point(190.65672335183538, 234.65672335183538),
                    new Point(189, 233),
                    new Point(185.507690430281, 230.38076782271077),
                    new Point(185, 230),
                    new Point(181, 229),
                    new Point(179.2553044437167, 228.12765222185834),
                    new Point(179, 228),
                    new Point(173, 226),
                    new Point(172.90458335201257, 225.97614583800313),
                    new Point(169, 225),
                    new Point(167, 225),
                    new Point(166.31640480067946, 225),
                    new Point(163, 225),
                    new Point(159.9661541340727, 226.51692293296367),
                    new Point(157, 228),
                    new Point(153.85052679060416, 229.25978928375832),
                    new Point(152, 230),
                    new Point(150, 231),
                    new Point(148.24693997116648, 232.75306002883352),
                    new Point(146, 235),
                    new Point(143.0622845069108, 236.9584769953928),
                    new Point(143, 237),
                    new Point(141, 239),
                    new Point(139, 242),
                    new Point(138.9369085970514, 242.18927420884583),
                    new Point(138, 245),
                    new Point(137, 248),
                    new Point(137, 248.58330480917087),
                    new Point(137, 250),
                    new Point(137, 253),
                    new Point(137, 254),
                    new Point(137, 255.29165240458542),
                    new Point(137, 256),
                    new Point(137, 257),
                    new Point(137, 257),
                    new Point(137, 258),
                    new Point(137, 259),
                    new Point(137, 259),
                    new Point(137, 260),
                    new Point(138, 260),
                    new Point(138, 260),
                    new Point(138, 260.99999999999994),
                    new Point(138, 261),
                    new Point(138, 261)
                )
            ),

            new Unistroke(
                'check',
                new Array(
                    new Point(91, 185),
                    new Point(93, 185),
                    new Point(95, 185),
                    new Point(97, 185),
                    new Point(100, 188),
                    new Point(102, 189),
                    new Point(104, 190),
                    new Point(106, 193),
                    new Point(108, 195),
                    new Point(110, 198),
                    new Point(112, 201),
                    new Point(114, 204),
                    new Point(115, 207),
                    new Point(117, 210),
                    new Point(118, 212),
                    new Point(120, 214),
                    new Point(121, 217),
                    new Point(122, 219),
                    new Point(123, 222),
                    new Point(124, 224),
                    new Point(126, 226),
                    new Point(127, 229),
                    new Point(129, 231),
                    new Point(130, 233),
                    new Point(129, 231),
                    new Point(129, 228),
                    new Point(129, 226),
                    new Point(129, 224),
                    new Point(129, 221),
                    new Point(129, 218),
                    new Point(129, 212),
                    new Point(129, 208),
                    new Point(130, 198),
                    new Point(132, 189),
                    new Point(134, 182),
                    new Point(137, 173),
                    new Point(143, 164),
                    new Point(147, 157),
                    new Point(151, 151),
                    new Point(155, 144),
                    new Point(161, 137),
                    new Point(165, 131),
                    new Point(171, 122),
                    new Point(174, 118),
                    new Point(176, 114),
                    new Point(177, 112),
                    new Point(177, 114),
                    new Point(175, 116),
                    new Point(173, 118)
                )
            ),
            new Unistroke('zig-zag', new Array(new Point(307, 216), new Point(333, 186), new Point(356, 215), new Point(375, 186), new Point(399, 216), new Point(418, 186))),
            new Unistroke(
                'arrow',
                new Array(
                    new Point(68, 222),
                    new Point(70, 220),
                    new Point(73, 218),
                    new Point(75, 217),
                    new Point(77, 215),
                    new Point(80, 213),
                    new Point(82, 212),
                    new Point(84, 210),
                    new Point(87, 209),
                    new Point(89, 208),
                    new Point(92, 206),
                    new Point(95, 204),
                    new Point(101, 201),
                    new Point(106, 198),
                    new Point(112, 194),
                    new Point(118, 191),
                    new Point(124, 187),
                    new Point(127, 186),
                    new Point(132, 183),
                    new Point(138, 181),
                    new Point(141, 180),
                    new Point(146, 178),
                    new Point(154, 173),
                    new Point(159, 171),
                    new Point(161, 170),
                    new Point(166, 167),
                    new Point(168, 167),
                    new Point(171, 166),
                    new Point(174, 164),
                    new Point(177, 162),
                    new Point(180, 160),
                    new Point(182, 158),
                    new Point(183, 156),
                    new Point(181, 154),
                    new Point(178, 153),
                    new Point(171, 153),
                    new Point(164, 153),
                    new Point(160, 153),
                    new Point(150, 154),
                    new Point(147, 155),
                    new Point(141, 157),
                    new Point(137, 158),
                    new Point(135, 158),
                    new Point(137, 158),
                    new Point(140, 157),
                    new Point(143, 156),
                    new Point(151, 154),
                    new Point(160, 152),
                    new Point(170, 149),
                    new Point(179, 147),
                    new Point(185, 145),
                    new Point(192, 144),
                    new Point(196, 144),
                    new Point(198, 144),
                    new Point(200, 144),
                    new Point(201, 147),
                    new Point(199, 149),
                    new Point(194, 157),
                    new Point(191, 160),
                    new Point(186, 167),
                    new Point(180, 176),
                    new Point(177, 179),
                    new Point(171, 187),
                    new Point(169, 189),
                    new Point(165, 194),
                    new Point(164, 196)
                )
            ),

            new Unistroke(
                'heart',
                new Array(
                    new Point(131, 129),
                    new Point(131, 129),
                    new Point(131, 129),
                    new Point(131, 129),
                    new Point(131, 128),
                    new Point(131, 127),
                    new Point(131, 126),
                    new Point(131, 122),
                    new Point(131, 121.56505939107251),
                    new Point(131, 121.56505939107251),
                    new Point(131, 119),
                    new Point(130, 115),
                    new Point(130, 114.25322440776267),
                    new Point(130, 114.25322440776267),
                    new Point(130, 114),
                    new Point(129, 111),
                    new Point(129, 109),
                    new Point(128.60395551819067, 107.01977759095342),
                    new Point(128.60395551819067, 107.01977759095342),
                    new Point(128, 104),
                    new Point(128, 104),
                    new Point(127, 103),
                    new Point(127, 101),
                    new Point(127, 101),
                    new Point(126.33450922901716, 100.33450922901716),
                    new Point(126.33450922901716, 100.33450922901716),
                    new Point(126, 100),
                    new Point(126, 99),
                    new Point(125, 96),
                    new Point(124, 94),
                    new Point(123.60152589549581, 93.60152589549581),
                    new Point(123.60152589549581, 93.60152589549581),
                    new Point(123, 93),
                    new Point(122, 92),
                    new Point(122, 91),
                    new Point(121, 90),
                    new Point(120, 89),
                    new Point(120, 88),
                    new Point(119.75844253557703, 87.75844253557703),
                    new Point(119.75844253557703, 87.75844253557703),
                    new Point(119, 87),
                    new Point(119, 87),
                    new Point(117, 86),
                    new Point(117, 85),
                    new Point(116, 85),
                    new Point(116, 85),
                    new Point(115, 84),
                    new Point(114.28794065103907, 84),
                    new Point(114.28794065103907, 84),
                    new Point(114, 84),
                    new Point(113, 83),
                    new Point(112, 83),
                    new Point(111, 83),
                    new Point(110, 83),
                    new Point(110, 83),
                    new Point(109, 83),
                    new Point(108, 83),
                    new Point(107.26721360448467, 83),
                    new Point(107.26721360448467, 83),
                    new Point(107, 83),
                    new Point(105, 83),
                    new Point(102, 83),
                    new Point(101, 84),
                    new Point(100.24648655793027, 84),
                    new Point(100.24648655793027, 84),
                    new Point(98, 84),
                    new Point(96, 85),
                    new Point(95, 85),
                    new Point(94, 85),
                    new Point(93.04761392650256, 85),
                    new Point(93.04761392650256, 85),
                    new Point(93, 85),
                    new Point(92, 85),
                    new Point(92, 86),
                    new Point(90, 86),
                    new Point(90, 86),
                    new Point(90, 86),
                    new Point(89, 86),
                    new Point(89, 86),
                    new Point(88, 87),
                    new Point(87.02688687994817, 87),
                    new Point(87.02688687994817, 87),
                    new Point(87, 87),
                    new Point(87, 87),
                    new Point(84, 88),
                    new Point(83, 89),
                    new Point(83, 89),
                    new Point(82, 90),
                    new Point(81, 90),
                    new Point(81, 90.41734894406476),
                    new Point(81, 90.41734894406476),
                    new Point(81, 91),
                    new Point(80, 91),
                    new Point(80, 91),
                    new Point(79, 91),
                    new Point(79, 92),
                    new Point(78, 92),
                    new Point(78, 93),
                    new Point(77, 93),
                    new Point(77, 93),
                    new Point(77, 93.85228955299225),
                    new Point(77, 93.85228955299225),
                    new Point(77, 94),
                    new Point(77, 94),
                    new Point(76, 95),
                    new Point(76, 95),
                    new Point(76, 96),
                    new Point(74, 97),
                    new Point(74, 98),
                    new Point(73, 99),
                    new Point(73, 99),
                    new Point(72.84250252889669, 99.15749747110331),
                    new Point(72.84250252889669, 99.15749747110331),
                    new Point(72, 100),
                    new Point(72, 101),
                    new Point(71, 103),
                    new Point(71, 106),
                    new Point(71, 106.00739412872838),
                    new Point(71, 106.00739412872838),
                    new Point(71, 108),
                    new Point(70, 112),
                    new Point(70, 113),
                    new Point(70, 113.31922911203822),
                    new Point(70, 113.31922911203822),
                    new Point(70, 117),
                    new Point(69, 120),
                    new Point(69, 120.59189206079733),
                    new Point(69, 120.59189206079733),
                    new Point(69, 123),
                    new Point(69, 125),
                    new Point(70, 127),
                    new Point(70, 127.79076469222504),
                    new Point(70, 127.79076469222504),
                    new Point(70, 128),
                    new Point(71, 131),
                    new Point(71, 132),
                    new Point(72, 134),
                    new Point(72.20066419311303, 134.8026567724521),
                    new Point(72.20066419311303, 134.8026567724521),
                    new Point(73, 138),
                    new Point(74.53725829943419, 141.84314574858544),
                    new Point(74.53725829943419, 141.84314574858544),
                    new Point(75, 143),
                    new Point(76, 145),
                    new Point(76, 148.95290247108738),
                    new Point(76, 148.95290247108738),
                    new Point(76, 149),
                    new Point(77, 150),
                    new Point(78, 152),
                    new Point(80, 155),
                    new Point(80.07322611972063, 155.10983917958094),
                    new Point(80.07322611972063, 155.10983917958094),
                    new Point(82, 158),
                    new Point(84, 160),
                    new Point(84.42077541318487, 161.05193853296217),
                    new Point(84.42077541318487, 161.05193853296217),
                    new Point(86, 165),
                    new Point(88.25054288819544, 167.25054288819544),
                    new Point(88.25054288819544, 167.25054288819544),
                    new Point(89, 168),
                    new Point(90, 171),
                    new Point(92, 173),
                    new Point(92.17188359922389, 173.34376719844778),
                    new Point(92.17188359922389, 173.34376719844778),
                    new Point(95, 179),
                    new Point(95.78565226502683, 179.7856522650268),
                    new Point(95.78565226502683, 179.7856522650268),
                    new Point(98, 182),
                    new Point(100, 185),
                    new Point(100.58062860423291, 185.38708573615529),
                    new Point(100.58062860423291, 185.38708573615529),
                    new Point(103, 187),
                    new Point(104, 188),
                    new Point(106.59017631544633, 189.72678421029755),
                    new Point(106.59017631544633, 189.72678421029755),
                    new Point(107, 190),
                    new Point(109, 191),
                    new Point(110, 192),
                    new Point(111, 193),
                    new Point(111, 193),
                    new Point(112, 194),
                    new Point(112.46368517478913, 194),
                    new Point(112.46368517478913, 194),
                    new Point(113, 194),
                    new Point(113, 194),
                    new Point(115, 195),
                    new Point(115, 196),
                    new Point(115, 196),
                    new Point(116, 196),
                    new Point(116, 197),
                    new Point(117, 197),
                    new Point(117, 197),
                    new Point(117, 197.66255780621685),
                    new Point(117, 197.66255780621685),
                    new Point(117, 198),
                    new Point(118, 198),
                    new Point(118, 198),
                    new Point(118, 198),
                    new Point(119, 199),
                    new Point(119, 199),
                    new Point(119, 199),
                    new Point(119, 199),
                    new Point(119, 199),
                    new Point(119, 199),
                    new Point(120, 200),
                    new Point(120, 200),
                    new Point(120, 200),
                    new Point(120, 200),
                    new Point(121, 200),
                    new Point(121, 201),
                    new Point(121, 201),
                    new Point(121, 201),
                    new Point(122, 201),
                    new Point(122, 201),
                    new Point(122, 201.26907129039816),
                    new Point(122, 201.26907129039816),
                    new Point(122, 202),
                    new Point(122, 202),
                    new Point(122, 202),
                    new Point(123, 202),
                    new Point(123, 202),
                    new Point(123, 202),
                    new Point(123, 202),
                    new Point(123, 202),
                    new Point(124, 202),
                    new Point(124, 202),
                    new Point(125, 201),
                    new Point(126, 201),
                    new Point(126, 201),
                    new Point(127, 200),
                    new Point(127.83065265167086, 199.72311578277638),
                    new Point(127.83065265167086, 199.72311578277638),
                    new Point(130, 199),
                    new Point(130, 199),
                    new Point(131, 198),
                    new Point(134, 197),
                    new Point(134.40429289890113, 196.59570710109887),
                    new Point(134.40429289890113, 196.59570710109887),
                    new Point(136, 195),
                    new Point(139, 194),
                    new Point(140.42552184369322, 192.57447815630678),
                    new Point(140.42552184369322, 192.57447815630678),
                    new Point(141, 192),
                    new Point(143, 191),
                    new Point(145, 190),
                    new Point(146.9965682862137, 189.2013726855145),
                    new Point(146.99656828621372, 189.2013726855145),
                    new Point(150, 188),
                    new Point(152, 187),
                    new Point(153.38881264509243, 185.61118735490757),
                    new Point(153.38881264509246, 185.61118735490754),
                    new Point(155, 184),
                    new Point(156, 184),
                    new Point(159, 182),
                    new Point(159.49267404226688, 181.75366297886657),
                    new Point(159.49267404226694, 181.75366297886654),
                    new Point(161, 181),
                    new Point(162, 180),
                    new Point(163, 180),
                    new Point(164, 179),
                    new Point(165, 179),
                    new Point(165, 178.0787281686893),
                    new Point(165, 178.07872816868925),
                    new Point(165, 178),
                    new Point(170.20162770034125, 172.79837229965875),
                    new Point(170.2016277003413, 172.7983722996587),
                    new Point(175.4589246226331, 167.5410753773669),
                    new Point(175.4589246226332, 167.5410753773668),
                    new Point(180.71622154492496, 162.28377845507504),
                    new Point(180.71622154492508, 162.28377845507492),
                    new Point(183, 160),
                    new Point(184, 159),
                    new Point(185, 159),
                    new Point(185, 158),
                    new Point(185.55930490484374, 157.44069509515626),
                    new Point(185.55930490484386, 157.44069509515614),
                    new Point(186, 157),
                    new Point(186, 156),
                    new Point(187, 156),
                    new Point(188, 154),
                    new Point(189, 153),
                    new Point(189.82124943467832, 152.17875056532168),
                    new Point(189.82124943467844, 152.17875056532156),
                    new Point(190, 152),
                    new Point(190, 152),
                    new Point(191, 149),
                    new Point(192, 148),
                    new Point(193, 148),
                    new Point(193, 146.39434208737376),
                    new Point(193, 146.3943420873736),
                    new Point(193, 145),
                    new Point(194, 145),
                    new Point(194, 144),
                    new Point(195, 143),
                    new Point(196, 142),
                    new Point(196, 141),
                    new Point(196.15002783345645, 140.84997216654355),
                    new Point(196.15002783345656, 140.84997216654344),
                    new Point(197, 140),
                    new Point(197, 138),
                    new Point(198, 136),
                    new Point(199, 135),
                    new Point(199, 135),
                    new Point(199.18423964183398, 134.447281074498),
                    new Point(199.18423964183404, 134.44728107449785),
                    new Point(200, 132),
                    new Point(200, 132),
                    new Point(201, 131),
                    new Point(202, 129),
                    new Point(202.85206247799894, 128.14793752200106),
                    new Point(202.85206247799903, 128.14793752200097),
                    new Point(203, 128),
                    new Point(203, 126),
                    new Point(203, 125),
                    new Point(204, 125),
                    new Point(204, 124),
                    new Point(204, 124),
                    new Point(204, 123),
                    new Point(204, 123),
                    new Point(204, 122),
                    new Point(204, 121.77427464107026),
                    new Point(204, 121.77427464107015),
                    new Point(204, 120),
                    new Point(204, 119),
                    new Point(204, 118),
                    new Point(204, 117),
                    new Point(204, 115),
                    new Point(204, 114.33933403214277),
                    new Point(204, 114.33933403214266),
                    new Point(204, 114),
                    new Point(203, 113),
                    new Point(203, 112),
                    new Point(202, 111),
                    new Point(202, 111),
                    new Point(202, 110),
                    new Point(201, 109),
                    new Point(200.6185420576439, 108.2370841152878),
                    new Point(200.61854205764385, 108.2370841152877),
                    new Point(200, 107),
                    new Point(199, 106),
                    new Point(199, 105),
                    new Point(198, 104),
                    new Point(198, 104),
                    new Point(198, 103),
                    new Point(197, 103),
                    new Point(197, 102.77658860365305),
                    new Point(197, 102.77658860365294),
                    new Point(197, 102),
                    new Point(197, 102),
                    new Point(196, 102),
                    new Point(196, 101),
                    new Point(196, 101),
                    new Point(195, 101),
                    new Point(195, 100),
                    new Point(195, 100),
                    new Point(194, 100),
                    new Point(194, 99),
                    new Point(193.34164799472555, 99),
                    new Point(193.34164799472543, 99),
                    new Point(193, 99),
                    new Point(193, 99),
                    new Point(192, 99),
                    new Point(192, 98),
                    new Point(191, 98),
                    new Point(191, 98),
                    new Point(190, 98),
                    new Point(190, 98),
                    new Point(189, 98),
                    new Point(188, 98),
                    new Point(188, 98),
                    new Point(187, 98),
                    new Point(187, 98),
                    new Point(186.9340321598632, 97.93403215986318),
                    new Point(186.9340321598631, 97.93403215986311),
                    new Point(186, 97),
                    new Point(186, 97),
                    new Point(185, 97),
                    new Point(185, 97),
                    new Point(184, 97),
                    new Point(183, 97),
                    new Point(183, 97),
                    new Point(182, 97),
                    new Point(180, 97),
                    new Point(180, 97),
                    new Point(179.88598033924364, 97),
                    new Point(179.88598033924353, 97),
                    new Point(179, 97),
                    new Point(178, 97),
                    new Point(177, 97),
                    new Point(176, 98),
                    new Point(176, 98),
                    new Point(175, 98),
                    new Point(174, 98),
                    new Point(174, 98),
                    new Point(173, 98),
                    new Point(172.87947888108354, 98.06026055945823),
                    new Point(172.87947888108346, 98.06026055945827),
                    new Point(171, 99),
                    new Point(171, 99),
                    new Point(170, 99),
                    new Point(169, 99),
                    new Point(168, 99),
                    new Point(166, 100),
                    new Point(165.93102077095415, 100.06897922904587),
                    new Point(165.9310207709541, 100.06897922904592),
                    new Point(165, 101),
                    new Point(163, 101),
                    new Point(162, 101),
                    new Point(162, 101),
                    new Point(161, 102),
                    new Point(160, 103),
                    new Point(159.71014871695309, 103),
                    new Point(159.71014871695303, 103),
                    new Point(158, 103),
                    new Point(158, 104),
                    new Point(157, 104),
                    new Point(156, 105),
                    new Point(155, 105),
                    new Point(154.07328117586277, 105.92671882413723),
                    new Point(154.07328117586272, 105.92671882413727),
                    new Point(154, 106),
                    new Point(154, 106),
                    new Point(153, 106),
                    new Point(153, 107),
                    new Point(153, 107),
                    new Point(152, 107),
                    new Point(152, 107),
                    new Point(152, 108),
                    new Point(151, 108),
                    new Point(150, 109),
                    new Point(150, 109),
                    new Point(150, 109.91709181378262),
                    new Point(150, 109.91709181378269),
                    new Point(150, 110),
                    new Point(149, 110),
                    new Point(148, 111),
                    new Point(148, 111),
                    new Point(147, 111),
                    new Point(147, 112),
                    new Point(146, 112),
                    new Point(146, 112),
                    new Point(146, 113),
                    new Point(145.06218113966298, 113),
                    new Point(145.0621811396629, 113),
                    new Point(145, 113),
                    new Point(145, 113),
                    new Point(145, 114),
                    new Point(144, 114),
                    new Point(144, 114),
                    new Point(143, 115),
                    new Point(143, 115),
                    new Point(142, 116),
                    new Point(141, 116),
                    new Point(141, 117),
                    new Point(140.45566765548168, 117),
                    new Point(140.4556676554816, 117),
                    new Point(140, 117),
                    new Point(140, 117),
                    new Point(140, 118),
                    new Point(140, 118),
                    new Point(139, 118),
                    new Point(139, 119),
                    new Point(139, 119),
                    new Point(138, 119),
                    new Point(138, 120),
                    new Point(138, 120),
                    new Point(137, 120),
                    new Point(137, 120.97927295344581),
                    new Point(137, 120.9792729534459),
                    new Point(137, 121),
                    new Point(137, 121),
                    new Point(137, 121),
                    new Point(136, 122),
                    new Point(136, 122),
                    new Point(136, 122),
                    new Point(136, 123),
                    new Point(136, 123),
                    new Point(135, 123),
                    new Point(135, 124),
                    new Point(135, 124),
                    new Point(135, 124),
                    new Point(135, 125),
                    new Point(134, 125),
                    new Point(134, 125),
                    new Point(134, 126),
                    new Point(134, 126),
                    new Point(134, 126),
                    new Point(134, 126)
                )
            ),
        ];
    }

    /**
     * 입력 좌표를 선택한 알고리즘으로 일치하는 템플릿을 탐색한다.
     * @param {Point[]} points
     * @param {boolean} useProtractor
     * @returns {Result} result Object
     */
    Recognize(points: Point[], useProtractor: boolean): Result {
        const t0 = Date.now();
        const candidate = new Unistroke('', points);

        let u = -1;
        let b = +Infinity;
        for (
            let i = 0;
            i < this.Unistrokes.length;
            i++ // for each unistroke template
        ) {
            let d;
            if (useProtractor) d = OptimalCosineDistance(this.Unistrokes[i].Vector, candidate.Vector); // Protractor
            else d = DistanceAtBestAngle(candidate.Points, this.Unistrokes[i], -AngleRange, +AngleRange, AnglePrecision); // Golden Section Search (original $1)
            if (d < b) {
                b = d; // best (least) distance
                u = i; // unistroke index
            }
        }
        const t1 = Date.now();
        return u == -1 ? new Result('No match.', 0.0, t1 - t0) : new Result(this.Unistrokes[u].Name, useProtractor ? 1.0 - b : 1.0 - b / HalfDiagonal, t1 - t0);
    }

    /**
     * 새로운 사용자 정의 제스처를 등록한다.
     * @param {string} name
     * @param {Point[]} points
     * @returns {number} num
     */
    AddGesture(name: string, points: Point[]): number {
        let num = 0;
        this.Unistrokes.push(new Unistroke(name, points)); // append new unistroke
        console.log(this.Unistrokes);
        for (let i = 0; i < this.Unistrokes.length; i++) {
            if (this.Unistrokes[i].Name === name) num++;
        }
        return num;
    }

    /**
     * 등록되어 있는 사용자 정의 제스처를 삭제한다.
     * @returns {number} 초기 템플릿 수
     */
    DeleteUserGestures(): number {
        this.Unistrokes.length = NumUnistrokes;
        return NumUnistrokes;
    }
}

/**
 * 두 좌표간 거리를 계산한다.
 * @param {Point} p1
 * @param {Point} p2
 * @returns {number} distance
 */
const Distance = (p1: Point, p2: Point): number => {
    const dx = p2.X - p1.X;
    const dy = p2.Y - p1.Y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 좌표들의 중심 좌표를 구한다.
 * @param {Point[]} points
 * @returns {Point} 중심 좌표
 */
const Centroid = (points: Point[]): Point => {
    let x = 0.0;
    let y = 0.0;

    for (let i = 0; i < points.length; i++) {
        x += points[i].X;
        y += points[i].Y;
    }
    x /= points.length;
    y /= points.length;
    return new Point(x, y);
};

/**
 * 각 좌표의 바운딩 박스를 얻는다.
 * @param {Point[]} points
 * @returns {Rectangle} 바운딩 박스
 */
const BoundingBox = (points: Point[]): Rectangle => {
    let minX = +Infinity,
        maxX = -Infinity,
        minY = +Infinity,
        maxY = -Infinity;
    for (let i = 0; i < points.length; i++) {
        minX = Math.min(minX, points[i].X);
        minY = Math.min(minY, points[i].Y);
        maxX = Math.max(maxX, points[i].X);
        maxY = Math.max(maxY, points[i].Y);
    }
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
};

/**
 * 각도를 라디안으로 변경한다.
 * @param {number} d 입력 각도
 * @returns {number} 라디안
 */
const Deg2Rad = (d: number): number => {
    return (d * Math.PI) / 180.0;
};

/**
 * Protractor 알고리즘에서 사용되는 최적의 코사인 거리를 계산한다.
 * 두 벡터 간 각도를 고려하여 코사인 거리를 계산한다.
 * @param {number[]} v1 벡터
 * @param {number[]} v2 벡터
 * @returns {number} 코사인
 */
const OptimalCosineDistance = (v1: number[], v2: number[]): number => {
    let a = 0.0;
    let b = 0.0;
    for (let i = 0; i < v1.length; i += 2) {
        a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
        b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
    }
    const angle = Math.atan(b / a);
    return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
};

/**
 * 최적의 각도 범위를 찾기 위해 Golden Section Search 알고리즘을 수행한다.
 * @param points
 * @param T
 * @param a
 * @param b
 * @param threshold
 * @returns
 */
const DistanceAtBestAngle = (points: Point[], T: any, a: number, b: number, threshold: number) => {
    let x1 = Phi * a + (1.0 - Phi) * b;
    let f1 = DistanceAtAngle(points, T, x1);
    let x2 = (1.0 - Phi) * a + Phi * b;
    let f2 = DistanceAtAngle(points, T, x2);

    while (Math.abs(b - a) > threshold) {
        if (f1 < f2) {
            b = x2;
            x2 = x1;
            f2 = f1;
            x1 = Phi * a + (1.0 - Phi) * b;
            f1 = DistanceAtAngle(points, T, x1);
        } else {
            a = x1;
            x1 = x2;
            f1 = f2;
            x2 = (1.0 - Phi) * a + Phi * b;
            f2 = DistanceAtAngle(points, T, x2);
        }
    }
    return Math.min(f1, f2);
};

/**
 * 각도로 부터 거리를 계산한다.
 * @param {Point[]} points
 * @param T
 * @param {number} radians
 * @returns {number} distance
 */
const DistanceAtAngle = (points: Point[], T: any, radians: number): number => {
    const nPoints = RotateBy(points, radians);
    return PathDistance(nPoints, T.Points);
};

/**
 * 두 좌표 목록을 기반으로 거리를 계산한다.
 * @param {Point[]} pts1
 * @param {Point[]} pts2
 * @returns {number} distance
 */
const PathDistance = (pts1: Point[], pts2: Point[]): number => {
    let d = 0.0;
    for (let i = 0; i < pts1.length; i++) {
        d += Distance(pts1[i], pts2[i]);
    }
    return d / pts1.length;
};

/**
 * 중심 좌표를 기준으로 좌표들을 회전한다.
 * @param {Point[]} points
 * @param {number} radians
 * @returns {Point[]} nPoints
 */
const RotateBy = (points: Point[], radians: number): Point[] => {
    const c = Centroid(points);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nPoints = [];

    for (let i = 0; i < points.length; i++) {
        const qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X;
        const qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
        nPoints.push(new Point(qx, qy));
    }
    return nPoints;
};

const NumUnistrokes = 5;
const NumPoints = 64;
const SquareSize = 250.0;
const Origin = new Point(0, 0);
const Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
const HalfDiagonal = 0.5 * Diagonal;
const AngleRange = Deg2Rad(45.0);
const AnglePrecision = Deg2Rad(2.0);
const Phi = 0.5 * (-1.0 + Math.sqrt(5.0));
