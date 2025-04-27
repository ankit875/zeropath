fn main(year_of_birth: u32, current_year: pub u32) {
    let age: u32 = current_year - year_of_birth;
    assert(age >=18);
}

#[test]
fn test_valid_age() {
    main(1994, 2025);
}
