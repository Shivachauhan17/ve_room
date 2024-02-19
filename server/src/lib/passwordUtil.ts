import crypto from 'crypto';

export interface saltHash{
    salt:string,
    hash:string
};

export const genPassword=(password:string):saltHash=>{
    
    const salt:string=crypto.randomBytes(32).toString('hex');
    const hash:string=crypto.pbkdf2Sync(password,salt,10000,64,'sha512').toString('hex');

    return{
        salt,
        hash
    }

}

export const validPassword=(password:string,salt:string,hash:string):boolean=>{

    const hashVerify:string=crypto.pbkdf2Sync(password,salt,10000,64,'sha512').toString('hex');

    return hash===hashVerify;
}