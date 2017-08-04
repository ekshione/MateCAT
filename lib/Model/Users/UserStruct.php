<?php
use Teams\MembershipDao;
use Teams\TeamDao;
use Users\MetadataDao;

/**
 * Created by PhpStorm.
 * User: roberto
 * Date: 01/04/15
 * Time: 12.54
 */


class Users_UserStruct extends DataAccess_AbstractDaoSilentStruct   implements DataAccess_IDaoStruct {

    public $uid;
    public $email;
    public $create_date;
    public $first_name;
    public $last_name;
    public $salt;
    public $pass;
    public $oauth_access_token ;

    public $email_confirmed_at ;
    public $confirmation_token ;
    public $confirmation_token_created_at ;

    public function clearAuthToken() {
        $this->confirmation_token = null ;
        $this->confirmation_token_created_at = null ;
    }

    public function initAuthToken() {
        $this->confirmation_token = Utils::randomString() ;
        $this->confirmation_token_created_at = Utils::mysqlTimestamp( time() );
    }

    public static function getStruct() {
        return new Users_UserStruct();
    }

    public function everSignedIn() {
        return ! ( is_null( $this->email_confirmed_at ) && is_null( $this->oauth_access_token ) );
    }

    public function fullName() {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function shortName() {
        return trim( mb_substr( $this->first_name, 0, 1 ) . "" . mb_substr( $this->last_name, 0, 1 ) );
    }

    public function getEmail() {
        return $this->email ;
    }

    /**
     * @return mixed
     */
    public function getUid() {
        return $this->uid;
    }

    /**
     * @return mixed
     */
    public function getFirstName() {
        return $this->first_name;
    }

    /**
     * @return mixed
     */
    public function getLastName() {
        return $this->last_name;
    }

    /**
     * @return null|\Teams\TeamStruct
     */
    public function getPersonalTeam() {
        $oDao = new TeamDao();
        $oDao->setCacheTTL( 60 * 60 * 24 );
        return $oDao->getPersonalByUser( $this );
    }

    /**
     * @return \Teams\TeamStruct[]|null
     */
    public function getUserTeams(){
        $mDao = new MembershipDao();
        return $mDao->findUserTeams( $this );
    }

    public function getMetadataAsKeyValue() {
        $dao = new MetadataDao() ;
        $collection = $dao->getAllByUid($this->uid) ;
        $data  = array();
        foreach ($collection as $record ) {
            $data[ $record->key ] = $record->value;
        }
        return $data;
    }

    /**
     * Returns true if password matches
     *
     * @param $password
     * @return bool
     */
    public function passwordMatch( $password ) {
        return Utils::encryptPass( $password, $this->salt ) == $this->pass ;
    }

    // TODO ------- start duplicated code, find a way to remove duplication

    /**
     * Returns the decoded access token.
     *
     * @param null $field
     *
     */
    public function getDecryptedOauthAccessToken() {
        $oauthTokenEncryption = OauthTokenEncryption::getInstance();
        return $oauthTokenEncryption->decrypt( $this->oauth_access_token );
    }

    /**
     * @param null $field
     * @return mixed
     * @throws \Exception
     */
    public function getDecodedOauthAccessToken($field=null) {
        $decoded = json_decode( $this->getDecryptedOauthAccessToken(), TRUE );

        if ( $field ) {
            if ( array_key_exists( $field, $decoded ) ) {
                return $decoded[ $field ] ;
            }
            else {
                throw new \Exception('key not found on token: ' . $field ) ;
            }
        }

        return $decoded  ;
    }


}
