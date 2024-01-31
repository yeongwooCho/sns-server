import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  /**
   * ValidationArguments 의 프로퍼티들
   * 1) value -> 검증 되고 있는 값 (입력된 값)
   *
   * 2) constraints -> 파라미터에 입력된 validation 제약 사항들
   * IsString 의 경우 추가 파라미터가 없어서 constraints 가 없음
   * Length 의 경우 constraints 에 1과 20이 리스트로 전달됨
   * args.constraints[0] === 1
   * args.constraints[1] === 20
   *
   * 3) targetName -> 검증하고 있는 클래스의 이름
   * === UsersModel
   *
   * 4) object -> 검증하고 있는 그 객체 (유용할 것 같은데 안씀)
   *
   * 5) property -> 검증되고 있는 객체의 프로퍼티 이름
   * === nickname
   */
  if (args.constraints.length === 2) {
    return `${args.property}은 ${args.constraints[0]}~${args.constraints[1]}글자를 입력해 주세요.`;
  } else {
    // 1개 일때 -> 최소값만 지정한 경우
    return `${args.property}은 최소 ${args.constraints[0]}글자를 입력해 주세요.`;
  }
};
