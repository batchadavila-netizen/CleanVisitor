class UserModel {
  final int id;
  final String nom;
  final String prenom;
  final String email;
  final int? visitorId;

  UserModel({
    required this.id,
    required this.nom,
    required this.prenom,
    required this.email,
    this.visitorId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      nom: json['nom'] ?? '',
      prenom: json['prenom'] ?? '',
      email: json['email'] ?? '',
      visitorId: json['visitorId'] ?? json['idVisitor'] ?? json['id'],
    );
  }
}

class LoginResponse {
  final String token;
  final UserModel user;

  LoginResponse({required this.token, required this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] ?? '',
      user: UserModel.fromJson(json['user']),
    );
  }
}