import { useNavigate } from 'react-router-dom';
/**
 * userType을 설정하는 컴포넌트
 * @returns {TSX.Element} Home Component
 */
export default function Home() {
    const navigate = useNavigate();
    const onClickBtn = (userType: TUser) => {
        sessionStorage.setItem('type', userType);
        navigate('/main');
    };
    return (
        <div className='flex w-screen min-h-screen justify-center items-center'>
            <div className='flex flex-col gap-3 w-full h-full items-center'>
                <p className='text-lg mb-5'>당신은?</p>
                <input
                    className='w-1/4 max-w-[300px] h-[50px] round-3xl rounded-3xl bg-[green] bg-opacity-20 shadow-xl cursor-pointer hover:bg-opacity-40'
                    type='button'
                    value='선생님'
                    onClick={() => onClickBtn('teacher')}
                />
                <input
                    className='w-1/4 max-w-[300px] h-[50px] round-3xl rounded-3xl bg-[navy] bg-opacity-20 shadow-xl cursor-pointer hover:bg-opacity-30'
                    type='button'
                    value='학생'
                    onClick={() => onClickBtn('learner')}
                />
            </div>
        </div>
    );
}
